# Android ROM identity and lower-screen language

The lower interface follows the complete SHA-1 and exact byte length of the
active imported cartridge. Android/device locale, file name, GBA region header
and strings that resemble a translation never grant execution compatibility.
No manual language selector is used. `ThorRomIdentity.activeLanguage(Context)`
is the presentation contract; the current reviewed identities select `en` or
`es`. Translation catalogs may additionally implement `fr` and `pt-BR`, but no
French or Brazilian Portuguese cartridge has been reviewed or admitted.

| SHA-1 | Bytes | Interface language | Evidence |
| --- | ---: | --- | --- |
| `f1c4b07554d2a3b1ad2f325307051e775ce68087` | 8,388,608 | en | Existing reviewed GoodTools/RetroAchievements identity; actual local file rehashed 2026-11-12 |
| `e65738e9d67688309f09811a54f495523ec9aada` | 8,388,608 | en | Existing reviewed No-Intro identity from repository policy; no matching local file found during this task |
| `ee667f656f6c3a128b9d59c657b3686e58b23eb5` | 10,514,228 | es | Existing reviewed expanded translation; two local copies rehashed and compared 2026-11-12 |

The available English/Spanish comparison confirms exactly 12 differing bytes
in `[0xC0, 0x6BCE8)`: three bytes in each previously reviewed pointer operand
at `0x4EFC`, `0x5414`, `0x1E744`, `0x1E9E0`. The pointer words change from
`0x08055620` to `0x08A013C0` and from `0x083BE3D4` to `0x08A030A8` (three
references). Excluding these exact operands, both code-region SHA-256 values
are `3b4d7ff043fe83feaa378a428b2f87cbbf8dfd25674376f36a76d79eba984ff6`.
The first remaining difference is at `0x6BCE8`; all later differences are in
the existing reviewed data/text region and the translation appends 2,125,620
bytes. The common 8 MiB have 141,500 changed bytes total. This confirms the
existing identity review; it does not admit arbitrary patches with similar
headers or pointer changes. No claim of full playthrough verification is made.

Import validation happens before an atomic same-directory replacement. Failed
validation leaves the previous ROM, saved identity and language unchanged.
Only a successfully installed reviewed ROM persists its active hash/language
and its per-hash language entry. Setup and pre-SDL startup hash the actual file,
including legacy installs; preferences are never a substitute for validation.
Unknown files log `detectedLanguage=unknown`, `compatible=false` and
`interfaceLanguage=en`, and cannot start the native game. A direct invalid game
launch fails before SDL/native initialization; setup keeps its Play action disabled.
When Android delivers Play to a retained `singleTask` game Activity after a ROM
change, the previous SDL thread is quit and joined before a fresh Activity starts
the selected cartridge. A changed/invalid file routes that retained Activity back
to setup instead. This prevents a newly selected interface language being shown
alongside an older cartridge still executing in the native singleton.

Run `sh tools/test_thor_rom_identity.sh [optional local ROM paths...]` for pure
Java regression checks. Optional files are read only, are never copied into
the project, and each is also tested after a one-byte in-memory code mutation.
