cmake_minimum_required(VERSION 3.20)
project(DragonBallZBuusFuryRecomp C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(GBARECOMP_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/gbarecomp"
    CACHE PATH "Path to this game's gbarecomp worktree")
if(NOT EXISTS "${GBARECOMP_ROOT}/CMakeLists.txt")
    message(FATAL_ERROR
        "GBARECOMP_ROOT is not a gbarecomp checkout: ${GBARECOMP_ROOT}")
endif()

# Android starts through the Java setup shell; the desktop launcher and its
# ImGui runtime adapter must be enabled together (they share one ImGui core).
set(_buus_fury_ui_default ON)
set(_buus_fury_runtime_ui_default "${CMAKE_CURRENT_SOURCE_DIR}/recomp-ui")
if(ANDROID)
    set(_buus_fury_ui_default OFF)
    set(_buus_fury_runtime_ui_default "")
endif()
option(GBAGAME_RECOMP_UI "Build the recomp-ui pre-boot launcher"
    ${_buus_fury_ui_default})
if(ANDROID AND GBAGAME_RECOMP_UI)
    set(_buus_fury_runtime_ui_default "${CMAKE_CURRENT_SOURCE_DIR}/recomp-ui")
endif()
set(GBARECOMP_RUNTIME_UI_ROOT "${_buus_fury_runtime_ui_default}"
    CACHE PATH "recomp-ui root used by the live GBA runtime adapter")
set(_buus_fury_recomp_ui_default "${CMAKE_CURRENT_SOURCE_DIR}/recomp-ui")
if(GBARECOMP_RUNTIME_UI_ROOT)
    set(_buus_fury_recomp_ui_default "${GBARECOMP_RUNTIME_UI_ROOT}")
endif()
set(RECOMP_UI_ROOT "${_buus_fury_recomp_ui_default}"
    CACHE PATH "Path to the shared recomp-ui checkout")
set(GBARECOMP_ENABLE_MODS ON CACHE BOOL
    "Enable the built-in Buu's Fury mod catalog" FORCE)

# Keep private BIOS-derived code in this game's ignored build tree. Desktop
# builds retain the engine's existing default; callers may override the path.
if(ANDROID)
    set(GBARECOMP_GENERATED_BIOS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/build-android-bios"
        CACHE PATH "Local BIOS recompilation output for Android")
endif()

if(ANDROID AND NOT GBAGAME_RECOMP_UI AND GBARECOMP_RUNTIME_UI_ROOT)
    message(FATAL_ERROR
        "Android without the launcher requires -DGBARECOMP_RUNTIME_UI_ROOT= "
        "to avoid linking an ImGui adapter without its shared core")
endif()
add_subdirectory("${GBARECOMP_ROOT}" gbarecomp_build EXCLUDE_FROM_ALL)

if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/generated/recompiled.cpp")
    message(FATAL_ERROR
        "Stale monolithic generated/recompiled.cpp found. Run tools/regen.ps1.")
endif()
file(GLOB GAME_GENERATED_SOURCES CONFIGURE_DEPENDS
    "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.c"
    "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp")

if(ANDROID)
    set(BUUS_FURY_TARGET main)
    add_library(${BUUS_FURY_TARGET} SHARED)
    target_link_libraries(${BUUS_FURY_TARGET} PRIVATE SDL2::SDL2 log android)
    # Fail at link time, rather than shipping an APK with missing entry points.
    target_link_options(${BUUS_FURY_TARGET} PRIVATE "-Wl,--no-undefined")
else()
    set(BUUS_FURY_TARGET DragonBallZBuusFuryRecomp)
    add_executable(${BUUS_FURY_TARGET})
endif()
target_sources(${BUUS_FURY_TARGET} PRIVATE
    src/main.cpp
    src/buus_fury_extended_view.cpp
    src/mods/buus_fury_adaptive_view_plugin.cpp
    ${GAME_GENERATED_SOURCES})

set(GAME_RECOMPILED_SOURCES ${GAME_GENERATED_SOURCES})
list(FILTER GAME_RECOMPILED_SOURCES INCLUDE REGEX
    "/recompiled_[0-9]+\\.cpp$")
if(GAME_RECOMPILED_SOURCES)
    set_source_files_properties(${GAME_RECOMPILED_SOURCES} PROPERTIES
        COMPILE_OPTIONS "-O1;-g0")
endif()

target_include_directories(${BUUS_FURY_TARGET} PRIVATE
    "${GBARECOMP_ROOT}/src/armv4t"
    "${GBARECOMP_ROOT}/src/gba"
    "${GBARECOMP_ROOT}/src/runtime"
    "${GBARECOMP_ROOT}/src/debug"
    src)

target_link_libraries(${BUUS_FURY_TARGET} PRIVATE
    "-Wl,--start-group"
    gbarecomp_runtime
    gbarecomp_debug
    gbarecomp_gba
    gbarecomp_armv4t
    "-Wl,--end-group")

target_compile_definitions(${BUUS_FURY_TARGET} PRIVATE
    GBARECOMP_DEFAULT_DEBUG_PORT=19889
    GBARECOMP_WINDOW_TITLE="DragonBallZBuusFuryRecomp"
    GBARECOMP_DEFAULT_GAME_CONFIG="game.toml")

if(GBAGAME_RECOMP_UI)
    include(${RECOMP_UI_ROOT}/recomp_ui.cmake)
    add_library(game_launcher_ui STATIC src/game_launcher_boot.cpp)
    target_include_directories(game_launcher_ui PRIVATE
        "${GBARECOMP_ROOT}/src/runtime"
        "${GBARECOMP_ROOT}/src/gba"
        src)
    target_compile_definitions(game_launcher_ui PRIVATE
        GBARECOMP_ENABLE_MODS=1)
    recomp_target_launcher_ui(game_launcher_ui
        CONSOLE gba
        BOXART ${CMAKE_CURRENT_SOURCE_DIR}/recomp/launcher/boxart.tga)
    if(NOT TARGET SDL2::SDL2)
        find_package(SDL2 REQUIRED)
    endif()
    target_link_libraries(game_launcher_ui PUBLIC SDL2::SDL2)
    if(WIN32)
        target_link_libraries(game_launcher_ui PUBLIC opengl32)
    endif()
    target_link_libraries(${BUUS_FURY_TARGET} PRIVATE game_launcher_ui)
    set_property(SOURCE src/main.cpp APPEND PROPERTY
        COMPILE_DEFINITIONS GBAGAME_RECOMP_UI)
endif()

set(BUUS_FURY_PRELOADED_MODS "${CMAKE_CURRENT_SOURCE_DIR}/mods/preloaded")
if(EXISTS "${BUUS_FURY_PRELOADED_MODS}/packages")
    add_custom_command(TARGET ${BUUS_FURY_TARGET} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${BUUS_FURY_PRELOADED_MODS}"
            "$<TARGET_FILE_DIR:${BUUS_FURY_TARGET}>/mods"
        COMMENT "Preloading the Buu's Fury mod catalog")
endif()

if(MSVC)
    target_link_options(${BUUS_FURY_TARGET} PRIVATE /STACK:16777216)
elseif(MINGW OR WIN32)
    target_link_options(
        ${BUUS_FURY_TARGET} PRIVATE -Wl,--stack,16777216)
endif()

# Thor map generator: reconstruct lower-screen maps from the imported ROM.
# Built separately from the game runtime and only on Android.
if(ANDROID)
    set(THOR_MAPS_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/src/thor_maps")

    add_library(thor_maps SHARED
        "${THOR_MAPS_ROOT}/thor_maps_jni.cpp"
        "${THOR_MAPS_ROOT}/thor_equipment_jni.cpp"
        "${THOR_MAPS_ROOT}/thor_inventory_jni.cpp"
        "${THOR_MAPS_ROOT}/dragonbytez/src/analysis.cpp"
        "${THOR_MAPS_ROOT}/dragonbytez/src/compression.cpp"
        "${THOR_MAPS_ROOT}/dragonbytez/src/png.cpp"
        "${THOR_MAPS_ROOT}/dragonbytez/src/rom.cpp"
    )

    target_include_directories(thor_maps PRIVATE
        "${THOR_MAPS_ROOT}/dragonbytez/include"
    )

    target_compile_features(thor_maps PRIVATE cxx_std_17)

    target_compile_options(thor_maps PRIVATE
        -O2
        -fvisibility=hidden
        -ffunction-sections
        -fdata-sections
    )

    target_link_options(thor_maps PRIVATE
        "-Wl,--gc-sections"
        "-Wl,--no-undefined"
    )
endif()
