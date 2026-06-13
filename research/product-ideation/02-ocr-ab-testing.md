# OCR A/B 打樣計畫與素材來源

> 2026-06-14 · 回應 goal `260614_1` 拍板項目「OCR 真實素材打樣（Ditto 去找公開影片自己擷取）」。

## 誠實的前提

我（Ditto）在目前的執行環境**無法直接觀看或擷取 YouTube 影片畫面**（沒有視覺播放/截圖能力）。所以我用兩個務實做法達成這件事：

1. **讓 app 直接吃截圖**（已實作，v0.0.3）：來源新增「上傳截圖（多張）」，每張截圖當一個影格、跳過影格抽取與過濾、直接逐張跑 ROI→OCR→事件。**任何截圖（我的、第一擁有者的、或從公開影片擷的）丟進去就能立刻看辨識結果與信心**。這是 A/B 打樣的關鍵啟用器。
2. **整理可擷取的公開影片來源 + 擷取協議**（本文下方），讓打樣集可被快速建立——由第一擁有者擷取，或用本機 `server/` 的 yt-dlp+ffmpeg 擷取單幀（自用、不再散佈）。

## A/B 打樣協議

目標：量化「新前處理（放大/二值化/設定）+ 字典校正」相對「原始 OCR」的準確度提升。

1. 準備 **30–50 張**涵蓋多情境的截圖：不同畫質（720p/1080p）、語言（英/日/中）、版面，且包含關鍵畫面——**訊息框**（特性發動、出招、擊倒）、**HP 數字**、**選出畫面**。
2. 在 app 用「上傳截圖」載入，框好對應 ROI（可存成 preset）。
3. 跑分析，記錄每個事件的 OCR 原文、信心、字典校正出的 entities。
4. 人工標注「正確答案」，算：可解析事件率、名稱辨識正確率、平均信心。
5. 對照研究建議的 go/no-go 門檻：**字典校正後可解析事件率 ≥85%** → 半自動產品可行；<60% → 需上雲端 OCR（Vision）或縮小範圍。

> 量測用的「原始 vs 改良」對照，可用 git 還原 `ocr.ts` 舊版跑一次、新版跑一次比較；之後若需要，我可在 app 內加一個「關閉前處理/字典」的開關來一鍵 A/B。

## 可擷取的公開影片來源（已驗證頻道/網站）

> 注意合規：下載 YouTube 影片通常違反其 ToS；擷取**單幀畫面供自己私下分析**屬個人使用範疇，請勿再散佈。詳見 `research/line1-tech-feasibility/08-youtube-url-ingestion.md`。

- **官方賽事直播 / VOD**：[worlds.pokemon.com](https://worlds.pokemon.com/en-us)、官方 Twitch `pokemon`、官方 YouTube。畫面標準、有主播字幕，**最適合做訊息框 OCR 打樣**。NAIC 2026（6/12–14）、後續 Worlds（8/28–30）都是好素材。
- **WolfeyVGC**：[youtube.com/c/WolfeyVGC](https://www.youtube.com/c/WolfeyVGC) — 大量實戰對戰，畫質佳。
- **CybertronVGC**：[youtube.com/@CybertronVGC](https://www.youtube.com/@CybertronVGC) — 對戰 + 分析。
- **賽果/隊伍頁附對戰連結**：[RK9 NAIC 2026](https://rk9.gg/event/pokemon-naic-2026/sides)、[Victory Road](https://victoryroad.pro/2026-naic/)。

> 平台提醒：上述多為《Scarlet/Violet》畫面。賽場正轉向《Pokémon Champions》（見 `line1-tech-feasibility/09`），新平台 UI 不同，**Champions 的對戰畫面要另外擷取一組打樣集 + 另存一套 ROI preset**。

## 我現在能做 / 需要協助的

- ✅ 已做：app 支援截圖來源、ROI preset 持久化、字典校正、回合分組——打樣的「量測台」已就緒。
- 🙋 需要素材：請第一擁有者丟幾張不同情境的對戰截圖（或我用本機 yt-dlp 擷單幀），我就能跑出第一份 A/B 數字，定 MVP 的 go/no-go。
