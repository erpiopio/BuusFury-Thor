package org.novapowers.buusfury.thor;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

/** No Android/device dependency; optional arguments inspect player-owned local ROMs. */
public final class ThorRomVariantTest {
    private static int checks;

    private static void check(boolean condition, String message) {
        checks++;
        if (!condition) throw new AssertionError(message);
    }

    public static void main(String[] args) throws Exception {
        for (String sha : new String[] {ThorRomVariant.EN_GOODTOOLS, ThorRomVariant.EN_NOINTRO}) {
            ThorRomVariant variant = ThorRomVariant.identify(sha, 8388608);
            check(variant.compatible, "Both reviewed EN dumps remain compatible");
            check("en".equals(variant.interfaceLanguage()), "English identity language");
            check(!ThorRomVariant.identify(sha, 10514228).compatible, "Identity requires matching size");
        }
        ThorRomVariant es = ThorRomVariant.identify(ThorRomVariant.ES_REVIEWED, 10514228);
        check(es.compatible && "es".equals(es.interfaceLanguage()), "Reviewed expanded Spanish dump");
        ThorRomVariant wrongSize = ThorRomVariant.identify(ThorRomVariant.ES_REVIEWED, 8388608);
        check(!wrongSize.compatible && "es".equals(wrongSize.detectedLanguage)
                && "en".equals(wrongSize.interfaceLanguage()), "Detection and execution policy are distinct");
        check(ThorRomVariant.identify(ThorRomVariant.ES_REVIEWED.toUpperCase(Locale.ROOT), 10514228)
                .compatible, "Digest normalization is independent of Android locale");
        for (String hash : new String[] {null, "", "ee667f656f6c3a128b9d59c657b3686e58b23eb4",
                "BG3E", "French", "pt-BR", " dbz-bf-español.gba "}) {
            ThorRomVariant unknown = ThorRomVariant.identify(hash, 10514228);
            check(!unknown.compatible && "unknown".equals(unknown.detectedLanguage)
                    && "en".equals(unknown.interfaceLanguage()), "Unknown hashes always fail closed");
        }
        byte[] fake = new byte[8388608];
        System.arraycopy(new byte[] {'B', 'G', '3', 'E'}, 0, fake, 0xac, 4);
        ThorRomVariant spoofedHeader = ThorRomVariant.inspect(new ByteArrayInputStream(fake));
        check(!spoofedHeader.compatible && "en".equals(spoofedHeader.interfaceLanguage()),
                "Retail-looking header and expected size cannot bypass digest gate");
        check("eef3696e26ac2e995bd701dd836de1119baceef3".equals(spoofedHeader.sha1),
                "Whole stream is hashed, including header and body");
        for (String arg : args) {
            byte[] rom = Files.readAllBytes(Path.of(arg));
            ThorRomVariant actual = ThorRomVariant.inspect(new ByteArrayInputStream(rom));
            check(actual.compatible, "Provided local ROM must match reviewed registry: " + arg);
            rom[0x100] ^= 1;
            ThorRomVariant modifiedCode = ThorRomVariant.inspect(new ByteArrayInputStream(rom));
            check(!modifiedCode.compatible && "en".equals(modifiedCode.interfaceLanguage()),
                    "Even a one-byte code modification of a supported translation must be rejected");
            System.out.println("Verified actual ROM " + actual.sha1 + " language=" + actual.detectedLanguage);
        }
        System.out.println("ThorRomVariant: " + checks + " checks passed");
    }
}
