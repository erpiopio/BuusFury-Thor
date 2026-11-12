#!/usr/bin/env python3
"""Check menu copy parity, bundled-catalog coverage, formats and font glyphs."""
import json
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "android/app/src/main/assets"
JAVA = ROOT / "android/app/src/main/java/org/novapowers/buusfury/thor"


def load(name):
    return json.loads((ASSETS / name).read_text(encoding="utf-8"))


def font_codepoints(path):
    data = path.read_bytes()
    count = struct.unpack_from(">H", data, 4)[0]
    cmap = None
    for index in range(count):
        pos = 12 + 16 * index
        tag, _, offset, _ = struct.unpack_from(">4sIII", data, pos)
        if tag == b"cmap":
            cmap = offset
            break
    assert cmap is not None, "Font has no cmap"
    supported = set()
    subtables = struct.unpack_from(">H", data, cmap + 2)[0]
    for index in range(subtables):
        platform, _, offset = struct.unpack_from(">HHI", data, cmap + 4 + 8 * index)
        if platform not in (0, 3):
            continue
        start = cmap + offset
        fmt = struct.unpack_from(">H", data, start)[0]
        if fmt == 4:
            segments = struct.unpack_from(">H", data, start + 6)[0] // 2
            ends = start + 14
            starts = ends + segments * 2 + 2
            deltas = starts + segments * 2
            ranges = deltas + segments * 2
            for segment in range(segments):
                first = struct.unpack_from(">H", data, starts + 2 * segment)[0]
                last = struct.unpack_from(">H", data, ends + 2 * segment)[0]
                delta = struct.unpack_from(">h", data, deltas + 2 * segment)[0]
                jump = struct.unpack_from(">H", data, ranges + 2 * segment)[0]
                for codepoint in range(first, min(last, 0xFFFE) + 1):
                    glyph = (codepoint + delta) & 0xFFFF
                    if jump:
                        address = ranges + 2 * segment + jump + 2 * (codepoint - first)
                        glyph = struct.unpack_from(">H", data, address)[0]
                        if glyph:
                            glyph = (glyph + delta) & 0xFFFF
                    if glyph:
                        supported.add(codepoint)
        elif fmt == 12:
            groups = struct.unpack_from(">I", data, start + 12)[0]
            for group in range(groups):
                first, last, glyph = struct.unpack_from(">III", data, start + 16 + 12 * group)
                supported.update(range(first + (glyph == 0), last + 1))
    return supported


def main():
    inventory = [item for tab in load("thor_inventory_catalog.json")["pestanas"] for item in tab]
    assert [item["id"] for item in inventory] == list(range(83))
    skills = load("thor_skills.json")
    quests = load("thor_quests.json")["misiones"]
    assert [item["id"] for item in skills] == list(range(24))
    assert [item["id"] for item in quests] == list(range(40))
    source = {
        "equipmentName": load("thor_equipment_names.json"),
        "equipmentDescription": load("thor_equipment_descriptions.json"),
        "inventoryName": [item["nombre"] for item in inventory],
        "inventoryDescription": [item["descripcion"] for item in inventory],
        "skill": [item["nombre"] for item in skills],
        "quest": [item["texto"] for item in quests],
    }
    assert len(source["equipmentName"]) == len(source["equipmentDescription"]) == 162
    catalogs = {tag: load("i18n/content-" + tag + ".json") for tag in ("en", "es", "fr", "pt-BR")}
    assert catalogs["es"] == source, "Spanish catalog no longer matches the bundled source"
    all_text = []
    for tag, catalog in catalogs.items():
        assert catalog.keys() == source.keys(), (tag, "catalog kinds")
        for kind, values in source.items():
            actual = catalog[kind]
            assert len(actual) == len(values), (tag, kind, "count")
            for item_id, (original, translation) in enumerate(zip(values, actual)):
                assert isinstance(translation, str), (tag, kind, item_id, "missing")
                assert bool(translation) == bool(original), (tag, kind, item_id, "empty")
                all_text.append(translation)

    # Parse the deliberately simple authored table; every key must have four entries.
    strings = (JAVA / "ThorUiStrings.java").read_text(encoding="utf-8")
    rows = re.findall(r'add\(copy, "([^"\\]+)", (.+)\);', strings)
    assert len(rows) >= 48, "UI key table unexpectedly incomplete"
    assert len(rows) == len({key for key, _ in rows}), "Duplicate UI translation key"
    keys = set()
    for key, values in rows:
        entries = re.findall(r'"((?:[^"\\]|\\.)*)"', values)
        assert len(entries) == 4, (key, "requires four locales")
        assert all(entries), (key, "empty text")
        formats = [re.findall(r'%(?:\d+\$)?[0-9.]*[dsf]', entry) for entry in entries]
        assert formats[1:] == formats[:-1], (key, "format argument mismatch")
        keys.add(key)
        all_text.extend(entries)
    presentation = (JAVA / "ThorMenuPresentation.java").read_text(encoding="utf-8")
    uses = set(re.findall(r'ui\.(?:text|format)\("([^"\\]+)"', presentation))
    assert uses <= keys, ("Missing UI translation keys", uses - keys)

    supported = font_codepoints(ASSETS / "PixelOperator.ttf")
    # Uppercasing is part of the presentation's shared-label painter.
    needed = {ord(char) for text in all_text for char in text + text.upper() if not char.isspace()}
    missing = needed - supported
    assert not missing, "PixelOperator lacks glyphs: " + ", ".join(f"U+{code:04X} {chr(code)}" for code in sorted(missing))
    print(f"PASS: {len(rows)} UI keys x 4 locales; 554 catalog entries x 4 locales; all font glyphs present")


if __name__ == "__main__":
    main()
