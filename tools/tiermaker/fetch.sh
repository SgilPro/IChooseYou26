#!/usr/bin/env bash
# 下載製作特性卡需要的原始資料到 .cache/tiermaker/（已在 .gitignore）。
# 這些檔案只會被「解析」，不會被執行。
set -euo pipefail
cd "$(dirname "$0")/../.."
C=.cache/tiermaker
mkdir -p "$C/showdown" "$C/champout"

SD_SHA=$(gh api repos/smogon/pokemon-showdown/commits/HEAD --jq .sha)
CO_SHA=$(gh api repos/projectpokemon/champout/commits/HEAD --jq .sha)
SD=https://raw.githubusercontent.com/smogon/pokemon-showdown/$SD_SHA/data
CO=https://raw.githubusercontent.com/projectpokemon/champout/$CO_SHA

get() { curl -fsS -o "$1" "$2"; sleep 1; }
# Showdown：現行 Champions 賽制（mod champions）的合法名單、各寶可夢的特性欄位
get "$C/showdown/mods_champions_formats-data.ts" "$SD/mods/champions/formats-data.ts"
get "$C/showdown/pokedex.ts" "$SD/pokedex.ts"
get "$C/showdown/text_abilities.ts" "$SD/text/abilities.ts"
# champout：從 Pokémon Champions 拆出的遊戲內文字與個體資料
get "$C/champout/personal.json" "$CO/masterdata/personal.json"
for l in tch usa; do
  get "$C/champout/${l}_tokusei.json" "$CO/rom-txt/$l/tokusei.json"
  get "$C/champout/${l}_tokuseiinfo_syn.json" "$CO/rom-txt/$l/tokuseiinfo_syn.json"
done
printf '{"showdown":"%s","champout":"%s","fetched_at":"%s"}\n' "$SD_SHA" "$CO_SHA" "$(date -u +%FT%TZ)" > "$C/manifest.json"
cat "$C/manifest.json"
