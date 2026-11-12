#!/usr/bin/env python3
"""Check catalog completeness, UI keys, and preservation of the existing map code.

This check does not run guest code and does not establish ROM compatibility.
The Android instrumentation separately measures actual font rasters on a device.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import tarfile
from pathlib import Path


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def method(source: str, name: str) -> str:
    match = re.search(r"\b(?:void|boolean|String|float|int)\s+" + re.escape(name) + r"\s*\([^)]*\)\s*\{", source)
    require(match is not None, f"Missing map method: {name}")
    start = match.start()
    brace = source.index("{", match.start())
    depth = 1
    position = brace + 1
    while depth:
        require(position < len(source), f"Unclosed map method: {name}")
        if source[position] == "{":
            depth += 1
        elif source[position] == "}":
            depth -= 1
        position += 1
    return source[start:position].strip()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--original-archive", type=Path)
    parser.add_argument("--template", type=Path)
    parser.add_argument("--map-template", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    assets = root / "android/app/src/main/assets"
    java = root / "android/app/src/main/java/org/novapowers/buusfury/thor"
    strings = (java / "ThorUiStrings.java").read_text(encoding="utf-8")
    keys = re.findall(r'add\(copy,\s*"([^"\r\n]+)"', strings)
    require(len(keys) == len(set(keys)), "Duplicate fixed UI translation key")
    used_keys = set()
    for source_path in java.glob("*.java"):
        source = source_path.read_text(encoding="utf-8")
        used_keys.update(re.findall(r'\bui\.(?:text|format)\("([^"]+)"', source))
    require(used_keys <= set(keys), f"Missing fixed UI keys: {sorted(used_keys - set(keys))}")

    inventory = json.loads((assets / "thor_inventory_catalog.json").read_text(encoding="utf-8"))
    original_inventory = [entry for tab in inventory["pestanas"] for entry in tab]
    equipment_names = json.loads((assets / "thor_equipment_names.json").read_text(encoding="utf-8"))
    equipment_descriptions = json.loads((assets / "thor_equipment_descriptions.json").read_text(encoding="utf-8"))
    skills = json.loads((assets / "thor_skills.json").read_text(encoding="utf-8"))
    quests = json.loads((assets / "thor_quests.json").read_text(encoding="utf-8"))["misiones"]
    originals = {
        "inventoryName": [entry["nombre"] for entry in original_inventory],
        "inventoryDescription": [entry.get("descripcion", "") for entry in original_inventory],
        "equipmentName": equipment_names,
        "equipmentDescription": equipment_descriptions,
        "skill": [entry["nombre"] for entry in skills],
        "quest": [entry["texto"] for entry in quests],
    }
    require([entry["id"] for entry in original_inventory] == list(range(83)), "Inventory ID indexing changed")
    require([entry["id"] for entry in skills] == list(range(24)), "Skill ID indexing changed")
    require([entry["id"] for entry in quests] == list(range(40)), "Quest ID indexing changed")
    counts = {}
    for tag in ("en", "es", "fr", "pt-BR"):
        catalog = json.loads((assets / "i18n" / f"content-{tag}.json").read_text(encoding="utf-8"))
        for kind, source_entries in originals.items():
            entries = catalog[kind]
            require(len(entries) == len(source_entries), f"{tag}:{kind} count mismatch")
            for index, (original, value) in enumerate(zip(source_entries, entries)):
                require(isinstance(value, str), f"{tag}:{kind}:{index} missing translation")
                require(not original.strip() or value.strip(), f"{tag}:{kind}:{index} unexpectedly blank")
                require("\ufffd" not in value, f"{tag}:{kind}:{index} has a damaged UTF-8 character")
            if tag == "es":
                require(entries == source_entries, f"Spanish source text was changed in {kind}")
        counts[tag] = sum(len(catalog[kind]) for kind in originals)

    presentation = (java / "ThorMenuPresentation.java").read_text(encoding="utf-8")
    for old_background in ("plantilla_diario.png", "plantilla_inventario.png",
                           "plantilla_habilidades.png", "equipo_ref/equipo_plantilla.png"):
        require(f'open("{old_background}")' not in presentation,
                f"Renderer still uses a language-specific background: {old_background}")
    for resource in ("plantilla.png", "plantilla_mapa.png", "PixelOperator.ttf"):
        require((assets / resource).is_file(), f"Missing menu resource: {resource}")
    for supplied, installed in ((args.template, "plantilla.png"), (args.map_template, "plantilla_mapa.png")):
        if supplied:
            require(hashlib.sha256(supplied.read_bytes()).digest() ==
                    hashlib.sha256((assets / installed).read_bytes()).digest(),
                    f"Installed resource differs from the user-supplied template: {installed}")

    map_preservation = "not requested"
    if args.original_archive:
        with tarfile.open(args.original_archive, "r:gz") as archive:
            path = "android/app/src/main/java/org/novapowers/buusfury/thor/ThorMenuPresentation.java"
            original = archive.extractfile(path).read().decode("utf-8").replace("\r\n", "\n")
            for name in ("setOriginalScouterMap", "setScouterGraphics", "setMapSnapshot", "dibujarRejillaRadar"):
                require(method(original, name) == method(presentation, name), f"Existing map method changed: {name}")
            marker = "// MAPA: ocupar toda la pantalla inferior por debajo del bezel."
            previous_block = original[original.index(marker):original.index("canvas.drawBitmap(seccion == 1 ? diario")].strip()
            current_block = presentation[presentation.index(marker):presentation.index("canvas.drawBitmap(seccion == 5 ? plantillaMapa")].strip()
            require(previous_block == current_block, "Existing Scouter/fallback drawing block changed")
            automatic_path = "android/app/src/main/java/org/novapowers/buusfury/thor/ThorAutomaticMap.java"
            require(archive.extractfile(automatic_path).read() == (java / "ThorAutomaticMap.java").read_bytes(),
                    "Detailed map fallback source changed")
        map_preservation = "original Java methods, draw block and detailed fallback are byte-identical"
    print(json.dumps({"result": "PASS", "fixedUiKeys": len(keys), "catalogEntries": counts,
                      "mapPreservation": map_preservation}, indent=2))


if __name__ == "__main__":
    main()
