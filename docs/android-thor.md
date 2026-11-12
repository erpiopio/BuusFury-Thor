# Android ARM64 / AYN Thor development

The Android project reuses `gbarecomp/platform/android` and its pinned SDL2 Java/native shell. It builds one game shared library (`libmain.so`) for `arm64-v8a`; the launcher and ImGui runtime adapter are disabled together for this first mobile build. Desktop CMake remains a separate target.

## Build on Linux

Run `./android/build.sh` from the repository root. This uses Java 17, SDK 35, NDK 27.1.12297006, Gradle 8.7 and Android Gradle Plugin 8.6.1. Gradle verifies the downloaded distribution using its official SHA-256 checksum. `ANDROID_HOME` and `JAVA_HOME` can override the defaults. Build caches stay under this repository (`build-android-gradle`, `build-android-user`, and Android's normal app build directories). Compilation runs at low priority with one native job and one Gradle worker. The Gradle JVM is limited to 768 MiB.

Useful checks: `./android/build.sh :app:compileDebugJavaWithJavac` compiles the Android shell without requesting the native build; `./android/build.sh :app:lintDebug` checks Android integration. The default build is `:app:assembleDebug`. Its APK is `android/app/build/outputs/apk/debug/app-debug.apk` and is a local development artifact, not approved for publication.

Generated cart and BIOS dispatch code must already exist locally. An APK build proves compilation and packaging, not correct guest execution. A stub BIOS dispatch table is insufficient to validate gameplay. Use the user's real hash-verified BIOS to regenerate it through the supported generator; never hand-edit generated sources. After each game run, inspect the coverage report and master miss list. Never describe a run as fully static if coverage reports interpreted or healed execution.

## Player-owned files and language

The APK does not package a ROM or BIOS. Setup imports an 8 MiB ROM and 16 KiB BIOS through Android's file picker and verifies their hashes. The accepted ROM SHA-1 values exactly match the existing reviewed three-dump gate:

- USA GoodTools/RetroAchievements: `f1c4b07554d2a3b1ad2f325307051e775ce68087`.
- USA No-Intro: `e65738e9d67688309f09811a54f495523ec9aada`.
- Existing Spanish text translation: `ee667f656f6c3a128b9d59c657b3686e58b23eb5`.

The Spanish import starts the Spanish ROM; there is no fabricated language toggle or automatic translation patch. One imported ROM is active at a time. Importing another replaces it; the persistent save currently uses the existing common EN/ES save path. Back up saves before switching dumps. BIOS SHA-1 remains `300c20df6731a33952ded8c436f7f186d25d3492` and is required. No HLE workaround is introduced.

The shared shell installs the runtime TOML at `files/variants/buus-fury/game.toml`. Its relative paths resolve to private `files/bios/gba_bios.bin`, `files/roms/dragon_ball_z_buus_fury_usa.gba`, and `files/saves/dragon_ball_z_buus_fury_usa.sav`. Native `mobile_prepare_process` changes the working directory to app-private storage. ROM/BIOS, saves, generated source, screenshots and runtime caches must remain uncommitted and unpublished.

## Two-screen behavior

Launch the game on the upper display using the device's normal launcher. This version keeps the single SDL game Activity on the display where it was launched. It does not infer which physical panel corresponds to a numeric display ID.

This first two-screen implementation is a prototype pending physical Thor validation. A plain Android `Presentation` hosts the permanent touch panel on an available presentation display. With exactly one candidate it is selected automatically; with multiple candidates the `Panel / pantallas` button shows all accessible secondary display names, dimensions and current IDs for explicit selection. Displays lacking the presentation flag are listed with an explicit unsupported-mode notice rather than disappearing from the selector. The selector also supports a closable local panel on devices with one screen. It does not move or duplicate the SDL Activity.

The second-screen window does not take keyboard focus, preserving the game window's focus during touch input. It uses its own display context and handles display add/remove/change and Activity pause/resume. Held controls are released on cancellation, panel removal and app backgrounding. No display ID is persisted across app sessions.

The panel sends SDL's existing keyboard events. It provides D-pad, A/B, L/R, Start, Select, hold-to-turbo and a Shift+P pause toggle using the runtime's default bindings. Start opens whatever menu the real game implements; it does not claim an inventory shortcut. Rebinding `keybinds.ini` or the pause hotkey changes these assumptions. Physical gamepad input remains on SDL.

Inventory, map and statistics are explicitly marked pending. This first shell does not read guest RAM, display simulated values or issue unverified writes. A future bridge must publish immutable, verified snapshots at a game-thread boundary and queue actions back to that thread; Java must not read or write guest memory directly. Adaptive widescreen also remains subject to separate mod/runtime verification.

## Validation still required on AYN Thor

No connected Thor/device was available when this shell was prepared. Android's current Presentation documentation states that built-in internal displays support this API from Android 16 onward; an older Thor OS may expose the lower panel as a vendor external/presentation display instead, but that has not been measured. Check `adb shell dumpsys display` for actual types/flags and validate touch routing. If it is an unsupported internal display, this version safely offers the local panel and a future secondary-Activity implementation will be needed. Building Java does not establish touch routing or game behavior on the physical handheld. Before calling the port playable:

1. Import a supported ROM and the real BIOS; verify clean startup and required BIOS dispatch generation.
2. Confirm upper and lower display roles with the selector, including reopening/closing the lower panel, and verify that touching it does not pause the upper game or steal gamepad input.
3. Test simultaneous direction + A/B and release outside a button, scroll cancellation, app background/resume, display disconnect/reconnect, fold/sleep/wake and rotation/resizing.
4. Verify pause/resume and hold-to-turbo against the running native game; check that no keys remain held after any lifecycle transition.
5. Confirm EEPROM save/reload and preserve player files on app updates; keep a backup before ROM-language switches.
6. Inspect native crash logs, coverage and miss artifacts after every run. Validate gameplay/accuracy with the sanctioned oracle/debugging workflow before claiming a fully static working game.

## Primary API references

- [AGP 8.6 compatibility: API 35, Gradle 8.7, JDK 17](https://developer.android.com/build/releases/agp-8-6-0-release-notes).
- [Android Presentation: display context, enumeration and display removal](https://developer.android.com/reference/android/app/Presentation).
- [ActivityOptions display launch restrictions](https://developer.android.com/reference/android/app/ActivityOptions#setLaunchDisplayId(int)) (relevant if a future version relocates the game Activity).

## Local prebuilt packaging for this server

The separate native test directory is `build-android-arm64`. To package those exact tested libraries without another full generated-code compilation, stage `libmain.so`, `libSDL2.so` and the matching NDK `libc++_shared.so` under `build-android-arm64/jniLibs/arm64-v8a/`, then run:

```sh
./android/build.sh -PthorPrebuiltNativeDir="$PWD/build-android-arm64/jniLibs" :app:assembleDebug
```

This mode is explicit and for local development. It disables Gradle's CMake step only when the property is set, checks the three libraries and rejects other ABI directories. The developer must rebuild/stage after native source changes; Gradle cannot establish that an arbitrary prebuilt directory matches current source. The default command still builds native code normally.

A direct native configure equivalent to Gradle's wrapper is:

```sh
cmake -S gbarecomp/platform/android/cpp -B build-android-arm64 -G Ninja \
  -DCMAKE_TOOLCHAIN_FILE="$ANDROID_HOME/ndk/27.1.12297006/build/cmake/android.toolchain.cmake" \
  -DANDROID_ABI=arm64-v8a -DANDROID_PLATFORM=android-28 -DANDROID_STL=c++_shared \
  -DGBA_GAME_ROOT="$PWD" -DGBAGAME_RECOMP_UI=OFF -DGBARECOMP_RUNTIME_UI_ROOT= \
  -DCMAKE_BUILD_TYPE=Release
nice -n 10 cmake --build build-android-arm64 --target main --parallel 1
```

## SDL compatibility and lint scope

The pinned SDL Java USB manager uses the Activity as its Context. Android 14+ requires an explicit receiver export flag for its custom USB permission broadcast. The game-owned Activity override supplies `RECEIVER_NOT_EXPORTED` on API 33+ for exactly `org.libsdl.app.USB_PERMISSION`, preserving the original path for other receiver filters and older versions. USB system attach/detach broadcasts still arrive; the existing permission PendingIntent is app-scoped on these versions. No SDL/submodule source is edited.

`app/lint.xml` records four deliberately narrow upstream-only exclusions: MissingPermission in the two optional SDL Bluetooth HID classes and optional audio-capture class, and the original HID manager's receiver warning covered by the Activity override. The app requests neither Bluetooth nor microphone permissions. SDL's checked Bluetooth initialization exits before those calls; the game opens only playback audio (`iscapture=0`). Standard Android gamepad events still use SDL; this initial build does not enable Steam Controller BLE discovery or recording.

`verifySdlCompatibility`, attached to preBuild and lint, pins the SHA-256 of the four audited SDL Java sources and checks their Context/USB/permission assumptions, the app manifest's absence of optional permissions, and the playback-only native call. A change fails the build until the assumptions and exceptions are reviewed again. These exclusions do not apply to game-owned code or other lint findings; no blanket baseline is used.

Touch controls also expose an accessibility click action, implemented as a short key pulse. Physical touch continues to hold and release the button without a duplicate pulse. Device testing remains necessary for USB permission flow and accessibility interaction.

Primary receiver guidance: [Android 14 runtime receiver rules](https://developer.android.com/about/versions/14/behavior-changes-14#runtime-receivers-exported), [USB host permission flow](https://developer.android.com/develop/connectivity/usb/host).

## Verified BIOS dispatch generation on this server

The user supplied the real 16 KiB BIOS locally; its SHA-1 was checked against `300c20df6731a33952ded8c436f7f186d25d3492`. The supported generator emitted 770 BIOS functions into the ignored project directory `build-android-bios`, rather than editing a generated stub or dirtying the engine submodule:

```sh
./gbarecomp/build/gba_recompile --bios gbarecomp/bios/gba_bios.bin \
  --config gbarecomp/bios/gba_bios.toml --out build-android-bios
```

Android CMake uses this generated directory through `GBARECOMP_GENERATED_BIOS_DIR` (the Android default points at `build-android-bios`). Regenerate through that command after a generator/BIOS configuration change and rebuild native libraries before restaging them for prebuilt APK packaging. Keep both the BIOS and its generated sources local and uncommitted. Compilation with real BIOS dispatch still does not establish a successful game boot or fully static gameplay; those require a device run and coverage/oracle evidence.
