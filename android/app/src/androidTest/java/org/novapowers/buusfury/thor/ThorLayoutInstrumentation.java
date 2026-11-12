package org.novapowers.buusfury.thor;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.view.View;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Exercises real Android Paint and the actual menu View with synthetic snapshots.
 * No native game is started and no ROM, save or BIOS file is read or modified.
 */
public final class ThorLayoutInstrumentation extends ThorImportInstrumentation {
    private static final String[] LANGUAGES = {"en", "es", "fr", "pt-BR"};
    private static final String[] KINDS = {"inventoryName", "inventoryDescription",
            "equipmentName", "equipmentDescription", "skill", "quest"};
    private static final int[] COUNTS = {83, 83, 162, 162, 24, 40};
    private int screenshots;
    private int rasterChecks;
    private boolean importSuite;

    @Override public void onCreate(Bundle arguments) {
        importSuite = arguments != null && "import".equals(arguments.getString("suite"));
        super.onCreate(arguments);
    }

    @Override public void onStart() {
        if (importSuite) {
            super.onStart();
            return;
        }
        Bundle result = new Bundle();
        try {
            Context context = getTargetContext();
            File directory = new File(context.getCacheDir(), "i18n-layouts");
            require(directory.isDirectory() || directory.mkdirs(), "Cannot create fixture output directory");
            checkCatalogs(context);
            AtomicReference<Throwable> failure = new AtomicReference<>();
            runOnMainSync(() -> {
                try {
                    for (String tag : LANGUAGES) {
                        checkRasterBounds(context, tag);
                        renderScenarios(context, directory, tag);
                    }
                } catch (Throwable error) {
                    failure.set(error);
                }
            });
            if (failure.get() != null) throw new AssertionError("Android layout fixture failed", failure.get());
            JSONObject report = new JSONObject();
            report.put("source", "synthetic Android menu fixtures; no guest execution");
            report.put("languages", new JSONArray(LANGUAGES));
            report.put("screenshots", screenshots);
            report.put("rasterBoundsChecks", rasterChecks);
            try (FileOutputStream output = new FileOutputStream(new File(directory, "report.json"))) {
                output.write(report.toString(2).getBytes(StandardCharsets.UTF_8));
            }
            result.putString("stream", "PASS: " + screenshots + " menu fixtures, " + rasterChecks +
                    " raster bounds checks, four complete content catalogs.\n" + directory + "\n");
            finish(Activity.RESULT_OK, result);
        } catch (Throwable error) {
            result.putString("stream", android.util.Log.getStackTraceString(error));
            finish(Activity.RESULT_CANCELED, result);
        }
    }

    private void checkCatalogs(Context context) throws Exception {
        List<String> keys = new ArrayList<>();
        Field copy = ThorUiStrings.class.getDeclaredField("COPY");
        copy.setAccessible(true);
        @SuppressWarnings("unchecked")
        java.util.Map<String, String[]> rows = (java.util.Map<String, String[]>) copy.get(null);
        keys.addAll(rows.keySet());
        for (String tag : LANGUAGES) {
            ThorUiStrings ui = new ThorUiStrings(tag);
            require(tag.equals(ui.languageTag()), "Unexpected language normalization: " + tag);
            for (String key : keys) require(!ui.text(key).trim().isEmpty(), tag + " missing UI key " + key);
            JSONObject catalog;
            try (InputStream input = context.getAssets().open("i18n/content-" + tag + ".json")) {
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                byte[] block = new byte[4096];
                int size;
                while ((size = input.read(block)) != -1) bytes.write(block, 0, size);
                catalog = new JSONObject(new String(bytes.toByteArray(), StandardCharsets.UTF_8));
            }
            for (int kind = 0; kind < KINDS.length; kind++) {
                JSONArray entries = catalog.getJSONArray(KINDS[kind]);
                require(entries.length() == COUNTS[kind], tag + " invalid count for " + KINDS[kind]);
                for (int id = 0; id < entries.length(); id++)
                    require(!entries.isNull(id), tag + " missing " + KINDS[kind] + ":" + id);
            }
        }
        require("en".equals(new ThorUiStrings("unknown").languageTag()), "Unknown locale must fall back to English");
    }

    private void checkRasterBounds(Context context, String tag) {
        ThorUiStrings ui = new ThorUiStrings(tag);
        ThorLabelPainter painter = new ThorLabelPainter(context);
        checkLabel(painter, ui.text("inventory").toUpperCase(Locale.ROOT), 108f, 470f, Paint.Align.CENTER, 64f);
        checkLabel(painter, ui.text("equipment").toUpperCase(Locale.ROOT), 108f, 480f, Paint.Align.CENTER, 64f);
        checkLabel(painter, ui.text("skills").toUpperCase(Locale.ROOT), 108f, 520f, Paint.Align.CENTER, 64f);
        checkLabel(painter, ui.text("journal"), 84f, 292f, Paint.Align.LEFT, 54f);
        checkLabel(painter, ui.text("inventory"), 84f, 340f, Paint.Align.RIGHT, 54f);
        checkLabel(painter, ui.text("nextLevel") + ":", 84f, 266f, Paint.Align.LEFT, 54f);
        checkLabel(painter, ui.text("activeQuests"), 57f, 445f, Paint.Align.CENTER, 34f);
        checkLabel(painter, ui.text("storyItems"), 40f, 415f, Paint.Align.CENTER, 28f);
        checkLabel(painter, ui.text("noEquipment"), 55f, 1072f, Paint.Align.CENTER, 34f);
        checkLabel(painter, ui.text("otherCharacter"), 24f, 256f, Paint.Align.CENTER, 18f);
        checkLabel(painter, ui.text("unequip"), 45f, 258f, Paint.Align.CENTER, 28f);
    }

    private void checkLabel(ThorLabelPainter painter, String text, float size,
                            float width, Paint.Align align, float minimum) {
        float fitted = painter.fittedSize(text, size, width - 4f, true);
        require(fitted >= minimum, "Unreadable fitted label: " + text + " (" + fitted + "px)");
        Bitmap bitmap = Bitmap.createBitmap(1240, 240, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        float x = align == Paint.Align.LEFT ? 80f : align == Paint.Align.RIGHT ? 1160f : 620f;
        painter.draw(canvas, text, x, 160f, size, width, align, Color.WHITE, true);
        int left = bitmap.getWidth(), right = -1, top = bitmap.getHeight(), bottom = -1;
        for (int y = 0; y < bitmap.getHeight(); y++) {
            for (int xx = 0; xx < bitmap.getWidth(); xx++) {
                int alpha = Color.alpha(bitmap.getPixel(xx, y));
                if (alpha != 0 && alpha != 255)
                    throw new AssertionError("Smoothed text or shadow pixel: " + text);
                if (alpha == 0) continue;
                left = Math.min(left, xx);
                right = Math.max(right, xx);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);
            }
        }
        float cellLeft = align == Paint.Align.LEFT ? x : align == Paint.Align.RIGHT ? x - width : x - width / 2f;
        float cellRight = cellLeft + width;
        require(right >= left, "Missing glyph raster: " + text);
        require(left >= Math.floor(cellLeft) - 1 && right <= Math.ceil(cellRight) + 1,
                "Label escapes its cell: " + text + " raster=" + left + ".." + right +
                        " cell=" + cellLeft + ".." + cellRight);
        require(top > 0 && bottom < bitmap.getHeight() - 1, "Vertical label clipping: " + text);
        bitmap.recycle();
        rasterChecks++;
    }

    private void renderScenarios(Context context, File directory, String tag) throws Exception {
        Class<?> type = Class.forName("org.novapowers.buusfury.thor.ThorMenuPresentation$EstadoArtView");
        Constructor<?> constructor = type.getDeclaredConstructor(Context.class, String.class);
        constructor.setAccessible(true);
        View view = (View) constructor.newInstance(context, tag);
        view.measure(View.MeasureSpec.makeMeasureSpec(1240, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(1080, View.MeasureSpec.EXACTLY));
        view.layout(0, 0, 1240, 1080);
        Method snapshot = type.getDeclaredMethod("setStats", int[].class);
        snapshot.setAccessible(true);
        snapshot.invoke(view, (Object) fixtureSnapshot());
        set(view, "cargando", false);
        String[] sections = {"status", "journal", "inventory", "skills", "equipment", "map"};
        for (int section = 0; section < sections.length; section++) {
            set(view, "seccion", section);
            save(view, new File(directory, tag + "-" + sections[section] + ".png"));
        }
        set(view, "seccion", 1);
        set(view, "diarioVista", 1);
        save(view, new File(directory, tag + "-active-quests.png"));
        set(view, "diarioVista", 2);
        save(view, new File(directory, tag + "-completed-quests.png"));
        ThorContentText localized = new ThorContentText(context, tag);
        List<String> longest = new ArrayList<>();
        for (int id = 0; id < 40; id++) longest.add(localized.localize("quest", id, ""));
        longest.sort((a, b) -> Integer.compare(b.length(), a.length()));
        set(view, "diarioVista", 1);
        set(view, "misionesActivas", longest.subList(0, 3).toArray(new String[0]));
        set(view, "estrellasActivas", new int[] {0, 1, 2});
        save(view, new File(directory, tag + "-long-quests.png"));
        set(view, "seccion", 2);
        set(view, "inventarioSeleccionado", 0);
        save(view, new File(directory, tag + "-inventory-detail.png"));
        set(view, "inventarioPestana", 1);
        set(view, "inventarioSeleccionado", 8);
        save(view, new File(directory, tag + "-story-detail.png"));
        set(view, "seccion", 4);
        set(view, "seleccionadoIdEquipo", 1);
        set(view, "idParaDesequipar", 1);
        save(view, new File(directory, tag + "-equipment-detail.png"));
        set(view, "cargando", true);
        save(view, new File(directory, tag + "-loading.png"));
    }

    private static int[] fixtureSnapshot() {
        int[] snapshot = new int[1472];
        snapshot[0] = 345; snapshot[1] = 999; snapshot[2] = 234; snapshot[3] = 888;
        snapshot[4] = 5009827; snapshot[6] = 9999999; snapshot[71] = 60 * 60 * 179;
        snapshot[72] = 0; snapshot[95] = 6;
        for (int id = 0; id < 6; id++) {
            snapshot[96 + id] = 1 + id;
            snapshot[102 + id] = id % 3;
        }
        snapshot[108] = 1;
        // Mixed active/completed quests use real bundled conditions, synthetic flag values.
        snapshot[221] = 0x0c;
        for (int id = 0; id < 83; id++) snapshot[373 + id] = 2;
        snapshot[456] = 4;
        int[] itemIds = {1, 45, 78, 113};
        for (int slot = 0; slot < 4; slot++) {
            snapshot[457 + slot * 4] = itemIds[slot];
            snapshot[460 + slot * 4] = 0x10;
            snapshot[1457 + slot] = 255 - slot * 17;
            snapshot[1462 + slot] = itemIds[slot];
        }
        snapshot[1461] = 1;
        snapshot[1468] = 1;
        return snapshot;
    }

    private void save(View view, File path) throws Exception {
        Bitmap bitmap = Bitmap.createBitmap(1240, 1080, Bitmap.Config.ARGB_8888);
        view.draw(new Canvas(bitmap));
        try (FileOutputStream output = new FileOutputStream(path)) {
            require(bitmap.compress(Bitmap.CompressFormat.PNG, 100, output), "PNG failed: " + path);
        }
        bitmap.recycle();
        screenshots++;
    }

    private static void set(Object instance, String name, Object value) throws Exception {
        Field field = instance.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(instance, value);
    }

    private static void require(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
