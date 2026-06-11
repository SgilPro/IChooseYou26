# 競品工具拆解 — 執行摘要與路線圖建議（Exec Summary）

> 軌道 C 摘要。給第一位 owner 規劃 **Game Log 之後** 的產品路線。
> 細節見：`01-tool-teardowns.md`（逐一拆解）、`02-feature-matrix-and-roadmap.md`（矩陣＋路線圖）。

## 我們拆了什麼
依第一位 owner 的清單，實地造訪並拆解 12 個現有 Pokémon 工具/網站（繁中 3、英文情報 2、英文單一工具 2、英文資料/meta 4，部分重疊）：
- **繁中**：bokevon 電龍計算機（傷害計算+圖鑑）、victorpoke Poké Champions（查詢+組隊）、冷颯 終極聯防模擬器（選出/聯防）。
- **英文情報**：Victory Road（賽事/租隊/報告中樞）、pokedata.ovh（賽事 standings/賽務，TCG 為主）。
- **英文單一工具**：pkmn.help（屬性計算機標竿）、Marriland Team Builder（覆蓋分析）。
- **英文資料/meta**：Pikalytics（usage/meta 綜合龍頭）、Serebii Champions（格式圖鑑）、LabMaus（賽事 usage 分析）、Pokémon Showdown Teambuilder（組隊與 paste 事實標準）。

## 最大發現（三句話）
1. **逐回合對戰 review 是空白市場**：12 個工具沒有一個把「把一場對戰拆成可回看、可評析的逐回合事件」當核心。我們的 Game Log 直接坐在這個空白上。
2. **沒人把 review 接成可行動的閉環**：現有工具各強一格（usage、組隊、屬性、賽果），玩家得在多個分頁間手動串。沒有「看完這場 → 對手常見 set → 你該怎麼選出 → 傷害多少」的一條龍。
3. **資料源高度集中且我們已盤好**：賽果＝Limitless 生態、usage＝Smogon/Showdown、傷害＝`@smogon/calc`。我們的資料源筆記已覆蓋這三條主幹，路線圖幾乎不必造新輪子。

## 缺口與機會（最值得做的）
- **REPLAY × CALC 交集無人做**：在逐回合事件上疊「情境化傷害」——把靜態傷害計算機升級成「這場比賽這一步的傷害」。
- **review → meta 對照 → 選出建議的閉環**：用 usage 資料與屬性聯防邏輯，讓 review 產生下一步行動。
- **繁中綜合站缺席**：繁中只有 calc 與模擬器，沒有 usage/meta+賽果+review 的綜合站——地緣優勢。
- **個人化沉澱薄弱**：幾乎沒人幫個別玩家累積對戰、找出反覆失誤。

## 路線圖建議（Game Log 之後，分階段）
**第 1 階段（緊接 Game Log，最便宜也最獨佔）**
1. **回合內情境傷害**：每個攻擊事件旁自動算傷害區間/是否一拳。重用 `@smogon/calc`。
2. **單場自動摘要**：每場自動生「出場/用招/用物/關鍵回合」摘要卡。零外部依賴。

**第 2 階段（把單場接上 meta）**
3. **Usage 對照**：對手 Pokémon 旁顯示 meta 常見 set/EV/隊友，標出非主流配置。重用 `data.pkmn.cc`。
4. **選出/聯防建議**：依對手陣容＋usage＋屬性弱抗，建議下次怎麼選出、有哪些破口。

**第 3 階段（長期沉澱與賽事連結）**
5. **對手 scouting 檔案**：同一對手多場 Game Log 聚成檔案（顆粒度到回合）。
6. **個人弱點報告**：跨多場找出反覆失誤模式。
7. **賽事/趨勢連結**：用 **Limitless API + webhook** 把近期賽果/趨勢與你的對戰連動。

**為何是這個順序**：第 1 階段只靠「我們已經抽出的事件」＋一個社群標準引擎（`@smogon/calc`），就能做出別人沒有的東西，投入小、差異化最大；第 2、3 階段再依序把開放資料源（Smogon usage、Limitless 賽果）接進來，把「回顧」變成「對照」再變成「會進步」。

**鐵律**：Showdown ladder usage ≠ 官方賽事 meta；做對照與趨勢時兩者要交叉標註。
