package org.novapowers.buusfury.thor;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.util.Xml;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import org.gbarecomp.GbaSetupActivity;
import org.xmlpull.v1.XmlPullParser;

/** Real importer regression checks using caller-staged, player-owned ROMs. */
public class ThorImportInstrumentation extends Instrumentation {
    private int checks;
    private ThorSetupActivity setup;
    private Method install;
    private Method refresh;
    private Field romReady;

    @Override public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        start();
    }

    @Override public void onStart() {
        Bundle result = new Bundle();
        Context context = getTargetContext();
        File active = ThorRomIdentity.activeFile(context);
        File input = new File(context.getCacheDir(), "i18n-import-input");
        File mutated = new File(input, "test-mutated-code.gba");
        File unknown = new File(input, "test-unknown-header.gba");
        SharedPreferences identity = context.getSharedPreferences("thor_rom_identity", Context.MODE_PRIVATE);
        SharedPreferences launcher = context.getSharedPreferences("setup", Context.MODE_PRIVATE);
        Map<String, ?> oldIdentity = new HashMap<>(identity.getAll());
        Map<String, ?> oldLauncher = new HashMap<>(launcher.getAll());
        byte[] originalRom = null;
        boolean originalExisted = active.isFile();
        boolean backedUp = false;
        boolean mutatedCreated = false;
        boolean unknownCreated = false;
        ActivityMonitor nativeGame = addMonitor(ThorGameActivity.class.getName(), null, true);
        Throwable failure = null;
        try {
            if (originalExisted) originalRom = Files.readAllBytes(active.toPath());
            backedUp = true;
            File en = new File(input, "en.gba");
            File es = new File(input, "es.gba");
            require(en.isFile() && es.isFile(), "Stage verified en.gba and es.gba in " + input);
            require("en".equals(inspect(en).interfaceLanguage()) && inspect(en).compatible,
                    "English staged input must match a reviewed identity");
            require("es".equals(inspect(es).interfaceLanguage()) && inspect(es).compatible,
                    "Spanish staged input must match its reviewed expanded identity");
            require(!mutated.exists() && !unknown.exists(), "Reserved test fixture names already exist");
            require(launcher.edit().putBoolean("skip_launcher_on_boot", false).commit(),
                    "Cannot temporarily disable game autostart");
            Intent intent = new Intent(context, ThorSetupActivity.class)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            intent.putExtra(GbaSetupActivity.EXTRA_AUTOSTART, false);
            setup = (ThorSetupActivity) startActivitySync(intent);
            waitForIdleSync();
            require(!setup.isFinishing() && nativeGame.getHits() == 0, "Setup must not launch the native game");
            install = GbaSetupActivity.class.getDeclaredMethod("installVerifiedAsset", Uri.class, boolean.class);
            install.setAccessible(true);
            refresh = GbaSetupActivity.class.getDeclaredMethod("refreshStatus");
            refresh.setAccessible(true);
            romReady = GbaSetupActivity.class.getDeclaredField("romReady");
            romReady.setAccessible(true);

            importAndCheck(context, en, "en");
            importAndCheck(context, es, "es");
            importAndCheck(context, en, "en");

            mutatedCreated = true;
            Files.copy(es.toPath(), mutated.toPath());
            try (RandomAccessFile file = new RandomAccessFile(mutated, "rw")) {
                file.seek(0x100);
                int old = file.readUnsignedByte();
                file.seek(0x100);
                file.writeByte(old ^ 1);
            }
            rejectAndCheck(context, mutated, "One-byte translated code mutation");

            unknownCreated = true;
            try (RandomAccessFile file = new RandomAccessFile(unknown, "rw")) {
                file.setLength(8388608);
                file.seek(0xac);
                file.write("BG3E".getBytes(StandardCharsets.US_ASCII));
            }
            rejectAndCheck(context, unknown, "Unknown ROM with retail-looking BG3E header");

            require(identity.edit().clear().commit(), "Cannot clear legacy identity fixture");
            onMain(() -> refresh.invoke(setup));
            require(romReady.getBoolean(setup), "Legacy ROM must be verified from actual bytes");
            require("en".equals(ThorRomIdentity.activeLanguage(context)), "Legacy startup language rehash");
            require(inspect(active).sha1.equals(identity.getString("active_sha1", "")),
                    "Legacy startup must persist its verified hash");
            require("en".equals(diskString(context, "thor_rom_identity", "active_language")),
                    "Legacy identity must be committed to disk");
            require(nativeGame.getHits() == 0, "No native activity may start during importer tests");
        } catch (Throwable error) {
            failure = error;
        } finally {
            try {
                if (setup != null) {
                    onMain(() -> setup.finish());
                    waitForIdleSync();
                }
            } catch (Throwable restoreError) {
                failure = append(failure, restoreError);
            }
            try {
                if (backedUp) {
                    if (originalExisted) write(active, originalRom);
                    else require(!active.exists() || active.delete(), "Cannot restore absent original ROM");
                    ThorRomIdentity.verifyActive(context, active);
                    require(originalExisted ? Arrays.equals(originalRom, Files.readAllBytes(active.toPath()))
                            : !active.exists(), "Original ROM must be restored byte for byte");
                }
            } catch (Throwable restoreError) {
                failure = append(failure, restoreError);
            }
            try {
                if (backedUp) {
                    restore(identity, oldIdentity);
                    require(oldIdentity.equals(identity.getAll()), "Original identity preferences must be restored");
                }
            } catch (Throwable restoreError) {
                failure = append(failure, restoreError);
            }
            try {
                if (backedUp) {
                    restore(launcher, oldLauncher);
                    require(oldLauncher.equals(launcher.getAll()), "Original setup preferences must be restored");
                }
            } catch (Throwable restoreError) {
                failure = append(failure, restoreError);
            }
            try {
                if (mutatedCreated) require(!mutated.exists() || mutated.delete(), "Cannot remove mutation fixture");
                if (unknownCreated) require(!unknown.exists() || unknown.delete(), "Cannot remove unknown fixture");
            } catch (Throwable restoreError) {
                failure = append(failure, restoreError);
            }
            removeMonitor(nativeGame);
        }
        if (failure != null) {
            result.putString("stream", android.util.Log.getStackTraceString(failure));
            finish(Activity.RESULT_CANCELED, result);
        } else {
            result.putString("stream", "PASS: " + checks + " actual importer/persistence checks; EN→ES→EN, " +
                    "mutated/unknown rejection, legacy rehash; original ROM and preferences restored.\n");
            finish(Activity.RESULT_OK, result);
        }
    }

    private void importAndCheck(Context context, File source, String language) throws Exception {
        ThorRomVariant expected = inspect(source);
        install.invoke(setup, Uri.fromFile(source), false);
        onMain(() -> refresh.invoke(setup));
        ThorRomVariant actual = inspect(ThorRomIdentity.activeFile(context));
        SharedPreferences prefs = context.getSharedPreferences("thor_rom_identity", Context.MODE_PRIVATE);
        require(actual.compatible && actual.sha1.equals(expected.sha1) && actual.size == expected.size,
                "Real importer must select the complete " + language + " file");
        require(romReady.getBoolean(setup), "Imported ROM readiness must rehash the active file");
        require(language.equals(ThorRomIdentity.activeLanguage(context)), "Active interface language " + language);
        require(expected.sha1.equals(prefs.getString("active_sha1", "")), "Persist active SHA-1");
        require(language.equals(prefs.getString("active_language", "")), "Persist active language");
        require(language.equals(prefs.getString("language_" + expected.sha1, "")), "Persist language per identity");
        require(expected.size == prefs.getLong("active_size", 0), "Persist exact active byte length");
        require(expected.sha1.equals(diskString(context, "thor_rom_identity", "active_sha1")),
                "Active SHA-1 must be committed on disk");
        require(language.equals(diskString(context, "thor_rom_identity", "active_language")),
                "Active language must be committed on disk");
    }

    private void rejectAndCheck(Context context, File source, String scenario) throws Exception {
        ThorRomVariant before = inspect(ThorRomIdentity.activeFile(context));
        SharedPreferences prefs = context.getSharedPreferences("thor_rom_identity", Context.MODE_PRIVATE);
        Map<String, ?> beforePrefs = new HashMap<>(prefs.getAll());
        String language = ThorRomIdentity.activeLanguage(context);
        boolean rejected = false;
        try {
            install.invoke(setup, Uri.fromFile(source), false);
        } catch (InvocationTargetException error) {
            if (!(error.getCause() instanceof IOException)) throw error;
            rejected = true;
        }
        require(rejected, scenario + " must be rejected by the actual importer");
        require(before.sha1.equals(inspect(ThorRomIdentity.activeFile(context)).sha1),
                scenario + " must retain the previously imported ROM");
        require(beforePrefs.equals(prefs.getAll()), scenario + " must retain persisted identity");
        require(language.equals(ThorRomIdentity.activeLanguage(context)), scenario + " must retain active language");
        ThorRomVariant unknown = inspect(source);
        require(!unknown.compatible && "en".equals(unknown.interfaceLanguage()),
                "Rejected variant independently reports incompatible with English fallback");
    }

    private static ThorRomVariant inspect(File file) throws IOException {
        try (FileInputStream input = new FileInputStream(file)) {
            return ThorRomVariant.inspect(input);
        }
    }

    private static void write(File file, byte[] bytes) throws IOException {
        File parent = file.getParentFile();
        if (!parent.isDirectory() && !parent.mkdirs()) throw new IOException("Cannot restore ROM directory");
        try (FileOutputStream output = new FileOutputStream(file)) {
            output.write(bytes);
            output.getFD().sync();
        }
    }

    @SuppressWarnings("unchecked")
    private void restore(SharedPreferences preferences, Map<String, ?> values) {
        SharedPreferences.Editor editor = preferences.edit().clear();
        for (Map.Entry<String, ?> entry : values.entrySet()) {
            Object value = entry.getValue();
            String key = entry.getKey();
            if (value instanceof String) editor.putString(key, (String) value);
            else if (value instanceof Boolean) editor.putBoolean(key, (Boolean) value);
            else if (value instanceof Integer) editor.putInt(key, (Integer) value);
            else if (value instanceof Long) editor.putLong(key, (Long) value);
            else if (value instanceof Float) editor.putFloat(key, (Float) value);
            else if (value instanceof Set) editor.putStringSet(key, (Set<String>) value);
            else throw new AssertionError("Unexpected preference type for " + key);
        }
        require(editor.commit(), "Cannot restore original preferences");
    }

    private static String diskString(Context context, String preferences, String key) throws Exception {
        File file = new File(context.getApplicationInfo().dataDir,
                "shared_prefs/" + preferences + ".xml");
        try (FileInputStream input = new FileInputStream(file)) {
            XmlPullParser parser = Xml.newPullParser();
            parser.setInput(input, "UTF-8");
            for (int event = parser.next(); event != XmlPullParser.END_DOCUMENT; event = parser.next()) {
                if (event == XmlPullParser.START_TAG && "string".equals(parser.getName()) &&
                        key.equals(parser.getAttributeValue(null, "name"))) return parser.nextText();
            }
        }
        return "";
    }

    private interface MainAction { void run() throws Exception; }

    private static Throwable append(Throwable previous, Throwable next) {
        if (previous == null) return next;
        previous.addSuppressed(next);
        return previous;
    }

    private void onMain(MainAction action) throws Exception {
        AtomicReference<Throwable> error = new AtomicReference<>();
        runOnMainSync(() -> {
            try { action.run(); } catch (Throwable thrown) { error.set(thrown); }
        });
        if (error.get() != null) throw new AssertionError("Main-thread setup check failed", error.get());
    }

    private void require(boolean condition, String message) {
        checks++;
        if (!condition) throw new AssertionError(message);
    }
}
