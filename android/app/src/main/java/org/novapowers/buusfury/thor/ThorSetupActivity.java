package org.novapowers.buusfury.thor;

import org.gbarecomp.GbaSetupActivity;
import org.gbarecomp.GbaGameConfig;
import java.io.File;
import java.io.IOException;

/** Imports only the three already reviewed EN/ES dumps and the real BIOS. */
public final class ThorSetupActivity extends GbaSetupActivity {
    @Override
    protected Class<?> gameActivityClass() { return ThorGameActivity.class; }

    @Override
    protected boolean isInstalledRomReady(File rom, GbaGameConfig game) {
        return ThorRomIdentity.verifyActive(this, rom);
    }

    @Override
    protected void validateImportedRom(String sha1, long size) throws IOException {
        ThorRomIdentity.validateImport(sha1, size);
    }

    @Override
    protected void onRomInstalled(File rom, String sha1, long size) {
        ThorRomIdentity.imported(this, rom, sha1, size);
    }
}
