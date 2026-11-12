#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT HUP INT TERM
javac -d "$OUT" \
  "$ROOT/android/app/src/main/java/org/novapowers/buusfury/thor/ThorRomVariant.java" \
  "$ROOT/tools/tests/ThorRomVariantTest.java"
java -cp "$OUT" org.novapowers.buusfury.thor.ThorRomVariantTest "$@"
