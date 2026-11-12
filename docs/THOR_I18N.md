# Lower-screen localization

The active cartridge identity controls the lower screen. There is no manual
language selector and Android's locale is not consulted. The reviewed registry
contains two English hashes and one Spanish hash; see `THOR_ROM_VARIANTS.md`
for sizes, evidence and compatibility limits. French and Brazilian Portuguese
copy is implemented and tested with synthetic layouts. No FR/PT-BR cartridge
has been admitted or tested in guest execution.

`ThorRomVariant` identifies an exact hash/length. `ThorRomIdentity` validates the
actual active file, persists its identity, and passes its language to
`ThorMenuPresentation`. Shared shell hooks validate before import replacement
and before SDL initialization. Rejected imports preserve the previous ROM.

`ThorUiStrings` owns fixed copy. `ThorContentText` owns localized versions of the
previously bundled Spanish catalogs: 162 equipment names/descriptions, 83 item
names/descriptions, 24 skills and 40 quests (554 entries per language). These
are authored interface translations, not extracted FR/PT ROM text. Text read
directly from a ROM must bypass this helper. Unidentified original objects
retain an explicitly unidentified description in each language.

The only menu backgrounds are `plantilla.png` and `plantilla_mapa.png`, copied
byte-for-byte from the supplied images. The former text-bearing templates are
excluded from the APK. Icons, portraits, nameplates and loading artwork remain.
`ThorMenuLabels` restores the former label positions; `ThorLabelPainter` uses
Pixel Operator, hard shadows and no antialiasing, with bounded single-line and
wrapped text. Map-frame white pixels are made transparent during loading.
The native Scouter and detailed map renderer are unchanged. The latter's empty
caption is localized by a separate overlay. Detailed maps remain in
`payload/thor_maps`; an unused duplicate asset tree is excluded.

## Build and checks

On this server the installed development APK uses `~/.android/debug.keystore`,
while the isolated Android user directory has a different key. Update both
app and instrumentation without uninstalling or clearing data:

```sh
./android/build.sh -PthorDebugKeystore="$HOME/.android/debug.keystore" \
  :app:assembleDebug :app:assembleDebugAndroidTest :app:lintDebug
sh tools/test_thor_rom_identity.sh /path/to/verified-en.gba /path/to/verified-es.gba
python3 tools/test_thor_localization.py
python3 tools/check_thor_i18n.py
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb install -r android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell am instrument -w org.novapowers.buusfury.thor.test/org.novapowers.buusfury.thor.ThorLayoutInstrumentation
```

The layout runner renders all languages and tabs on Android using synthetic
snapshots. Its images and report stay in target `cache/i18n-layouts`. They do
not establish guest execution, touch routing or cartridge compatibility.

The import suite (`am instrument -w -e suite import` with the same layout
runner component) exercises the actual importer
using user-owned files staged at target `cache/i18n-import-input/en.gba` and
`es.gba`. It checks EN→ES→EN persistence, rejects altered code/spoofed headers,
and rehashes legacy installs. It restores the original ROM and preference maps
in `finally` and blocks native game launch during the checks. Save files and
BIOS are not changed.

The original Java map methods/drawing block and `ThorAutomaticMap` can be
compared against the pre-change source archive with
`check_thor_i18n.py --original-archive /path/to/source-snapshot.tgz`.
`tools/test_thor_scouter_map.cpp` additionally compares existing local map
states against authentic map/marker pixels and checks guest memory is unchanged.

No ROM, BIOS, save, generated cart source or signing key belongs in source
control or a public release. No changes from this task have been pushed.
