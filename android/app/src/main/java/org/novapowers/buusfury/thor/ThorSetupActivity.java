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
        if (!ThorRomIdentity.verifyActive(this, rom)) return false;
        return ThorMapExtractor.mapsReady(this, ThorRomIdentity.activeSha1())
            && ThorEquipmentExtractor.ready(this, ThorRomIdentity.activeSha1())
            && ThorInventoryExtractor.ready(this, ThorRomIdentity.activeSha1())
            && ThorPortraitExtractor.ready(this, ThorRomIdentity.activeSha1());
    }

    @Override
    protected void validateImportedRom(String sha1, long size) throws IOException {
        ThorRomIdentity.validateImport(sha1, size);
    }

    @Override
    protected boolean needsInstalledRomPreparation(File rom) {
        if (!ThorRomIdentity.verifyActive(this, rom)) return false;
        return !ThorMapExtractor.mapsReady(
            this, ThorRomIdentity.activeSha1())
            || !ThorEquipmentExtractor.ready(this, ThorRomIdentity.activeSha1())
            || !ThorInventoryExtractor.ready(this, ThorRomIdentity.activeSha1())
            || !ThorPortraitExtractor.ready(this, ThorRomIdentity.activeSha1());
    }

    @Override
    protected void prepareInstalledRom(File rom) throws IOException {
        if (!ThorRomIdentity.verifyActive(this, rom)) {
            throw new IOException("La ROM instalada no está verificada");
        }

        ThorMapExtractor.prepareMaps(
            this, rom, ThorRomIdentity.activeSha1());
        ThorEquipmentExtractor.prepare(
            this, rom, ThorRomIdentity.activeSha1());
        ThorInventoryExtractor.prepare(
            this, rom, ThorRomIdentity.activeSha1());
        ThorPortraitExtractor.prepare(
            this, rom, ThorRomIdentity.activeSha1());
    }

    @Override
    protected void prepareImportedRom(File temporary, String sha1, long size)
            throws IOException {
        ThorMapExtractor.prepareMaps(this, temporary, sha1);
        ThorEquipmentExtractor.prepare(this, temporary, sha1);
        ThorInventoryExtractor.prepare(this, temporary, sha1);
        ThorPortraitExtractor.prepare(this, temporary, sha1);
    }

    @Override
    protected void onRomInstalled(File rom, String sha1, long size) {
        ThorRomIdentity.imported(this, rom, sha1, size);
    }
}
