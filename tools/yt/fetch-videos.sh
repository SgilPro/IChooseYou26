#!/usr/bin/env bash
# 逐支抓影片 metadata（info.json）+ 置頂/熱門留言 + 字幕（手動 zh-TW 優先，備援自動字幕）。
# 不下載影片本體。遇到會員限定/私人影片會記進 errors.log 並繼續。
#
# 用法：tools/yt/fetch-videos.sh <ids.txt> <rawDir> [extra yt-dlp args...]
# 例：  tools/yt/fetch-videos.sh data/channels/fiskepokemon/raw/ids.txt data/channels/fiskepokemon/raw
# 之後補會員影片：加 --cookies cookies.txt（照 yt-dlp wiki 用無痕視窗匯出，不要 --cookies-from-browser）
#
# 速率：未登入約 300 支/小時上限。實測含留言 + 4 種字幕時每支要 ~80 秒（請求太多），
# 所以預設不抓留言、只抓 zh-TW 手動字幕 + zh-Hant 自動字幕備援，每支約 8~12 秒，679 支約 2 小時。
# 要抓留言（置頂留言找 pokepaste）請設 WITH_COMMENTS=1，建議只對 battle 類影片的 id 清單跑。
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

COMMENT_ARGS=()
XARGS="youtube:lang=zh-TW"
if [ "${WITH_COMMENTS:-0}" = "1" ]; then
  COMMENT_ARGS=(--write-comments)
  XARGS="youtube:lang=zh-TW;comment_sort=top;max_comments=20,0,0,0"
fi

yt-dlp \
  --batch-file "$TODO" \
  --skip-download --ignore-errors --no-overwrites \
  --extractor-args "$XARGS" \
  --write-info-json ${COMMENT_ARGS[@]+"${COMMENT_ARGS[@]}"} \
  --write-subs --write-auto-subs --sub-langs "zh-TW,zh-Hant" --sub-format "json3/vtt" \
  --sleep-requests 0.75 --sleep-interval 3 --max-sleep-interval 6 --sleep-subtitles 1 \
  --no-progress --no-warnings \
  -o "$RAW/%(id)s.%(ext)s" \
  "$@" 2>> "$RAW/errors.log"

echo "[fetch] done. info.json: $(ls "$RAW"/*.info.json 2>/dev/null | wc -l | tr -d ' '); errors: $(grep -c 'ERROR' "$RAW/errors.log" 2>/dev/null || echo 0)" >&2
