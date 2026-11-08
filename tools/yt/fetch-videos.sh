#!/usr/bin/env bash
# 逐支抓影片 metadata（info.json）+ 置頂/熱門留言 + 字幕（手動 zh-TW 優先，備援自動字幕）。
# 不下載影片本體。遇到會員限定/私人影片會記進 errors.log 並繼續。
#
# 用法：tools/yt/fetch-videos.sh <ids.txt> <rawDir> [extra yt-dlp args...]
# 例：  tools/yt/fetch-videos.sh data/channels/fiskepokemon/raw/ids.txt data/channels/fiskepokemon/raw
# 之後補會員影片：加 --cookies cookies.txt（照 yt-dlp wiki 用無痕視窗匯出，不要 --cookies-from-browser）
#
# 速率：未登入約 300 支/小時上限；這裡每支睡 5~10 秒、每個請求 1.5 秒，674 支約 1.5~2 小時。
set -u
IDS="${1:?ids.txt}"
RAW="${2:?rawDir}"
shift 2
mkdir -p "$RAW"

# 已抓過的（有 info.json）跳過，可中斷重跑
TODO="$RAW/.todo.txt"
: > "$TODO"
while read -r id; do
  [ -z "$id" ] && continue
  [ -f "$RAW/$id.info.json" ] || echo "$id" >> "$TODO"
done < "$IDS"
echo "[fetch] todo: $(wc -l < "$TODO" | tr -d ' ') / $(wc -l < "$IDS" | tr -d ' ')" >&2

yt-dlp \
  --batch-file "$TODO" \
  --skip-download --ignore-errors --no-overwrites \
  --extractor-args "youtube:lang=zh-TW;comment_sort=top;max_comments=30,10,5,5" \
  --write-info-json --write-comments \
  --write-subs --write-auto-subs --sub-langs "zh-TW,zh-Hant,zh,en" --sub-format "json3/vtt" \
  --sleep-requests 1.5 --sleep-interval 5 --max-sleep-interval 10 --sleep-subtitles 2 \
  --no-progress --no-warnings \
  -o "$RAW/%(id)s.%(ext)s" \
  "$@" 2>> "$RAW/errors.log"

echo "[fetch] done. info.json: $(ls "$RAW"/*.info.json 2>/dev/null | wc -l | tr -d ' '); errors: $(grep -c 'ERROR' "$RAW/errors.log" 2>/dev/null || echo 0)" >&2
