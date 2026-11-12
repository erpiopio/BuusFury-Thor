#!/usr/bin/env bash
set -euo pipefail
android_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
game_dir="$(dirname -- "$android_dir")"
export GRADLE_USER_HOME="$game_dir/build-android-gradle"
export ANDROID_USER_HOME="$game_dir/build-android-user"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export PATH="$JAVA_HOME/bin:$PATH"
cd "$android_dir"
if (($# == 0)); then set -- :app:assembleDebug; fi
exec nice -n 10 ./gradlew --no-daemon --max-workers=1 -PgbaAbis=arm64-v8a -PgbaNativeJobs=1 "$@"
