# 影像辨識訓練資料源（sprite / 圖像 / 在地化命名）

> 目標：讓產品能從截圖／畫面辨識場上的 Pokémon、招式、道具、特性，並正確對應到繁中名稱。每個源都查證過取用方式，並標註版權紀律。

---

## 1. PokeAPI/sprites — 辨識訓練主力資料集

- **GitHub**：<https://github.com/PokeAPI/sprites/>（npm `pokeapi-sprites`，可走 CDN；releases <https://github.com/PokeAPI/sprites/releases>）
- **內容與目錄**：
  - `sprites/pokemon/other/home/` — **Pokémon HOME 風格 PNG**（高品質、現代、最接近遊戲內呈現，辨識首選）。
  - `sprites/pokemon/other/official-artwork/` — 官方美術 PNG。
  - `sprites/pokemon/other/dream-world/` — SVG。
  - `sprites/pokemon/versions/` — 各世代 sprite（含 Gen5 B&W 動畫 GIF 等）。
- **授權**：PokeAPI 已聚合社群授權（如感謝 Smogon 提供 ID>650 的 B&W 風格 sprite）。相對乾淨、可放心當訓練／展示素材。

**我的用法**：以 `home/` PNG 為主建立「Pokémon 視覺類別資料集」；用 `official-artwork/` 擴增。形態差異（mega、地區形態、太晶等）要逐 form 收齊。

---

## 2. PokeAPI 本體 — metadata + sprite URL

- **網站 / 文件**：<https://pokeapi.co/>
- **提供**：Pokémon / 招式 / 道具 / 特性 / 形態 的結構化 metadata，以及每隻對應的 sprite URL。
- **用法**：建立「類別標籤 ↔ sprite ↔ 屬性/招式/道具 metadata」的對應，作為辨識結果的 ground-truth 與後續推理（辨識出 Pokémon 後查它的合法招式/特性）。

---

## 3. 神奇寶貝百科（52Poke Wiki）— 繁中正式譯名權威

- **首頁**：<https://wiki.52poke.com/zh-hant/神奇寶貝百科>
- **全國圖鑑列表（繁中）**：<https://wiki.52poke.com/zh-hant/寶可夢列表（按全國圖鑑編號）>
- **官方台灣寶可夢圖鑑**：<https://tw.portal-pokemon.com/play/pokedex>
- **用途**：**繁中產品在地化的命名權威**。每隻 Pokémon、招式、道具、特性的繁中正式譯名以此為準。

**關鍵洞見——跨語言 ID 對照表（必建）**：
資料源各用各的命名（Showdown 用英文 ID、Limitless 英文、Pikalytics 英文、日本選手用日文、產品 UI 用繁中）。我必須建一張對照表：
```
national_dex_id | en (Showdown ID) | ja | zh-Hant(52Poke) | forms[]
```
否則 Limitless 拉回的英文隊伍接不上繁中 UI。此表以 national dex id 為主鍵，英文取自 PokeAPI / Showdown dex，繁中取自 52Poke / 官方台灣圖鑑。

---

## 4. Bulbapedia — 英文權威百科（補充）
- **網站**：<https://bulbapedia.bulbagarden.net/>
- **用途**：英文機制／招式／互動的權威說明，補強 PokeAPI 缺的「文字描述與互動細節」（如某特性的判定時機）。

---

## 版權與資料紀律（Caution 紅線）
1. **訓練資料優先用 sprite / 官方 artwork（PokeAPI），不直接爬比賽 VOD 影格**——遊戲畫面截圖有版權與肖像疑慮，影格爬取留作最後手段且需審慎評估授權。
2. **形態完整性**：mega、太晶（Tera）、地區形態、性別差異都會影響辨識與對戰判斷，資料集須逐 form 收齊。
3. **命名以官方繁中為準**：避免自創或混用譯名，一律對齊 52Poke / 官方台灣圖鑑。

---

## 建議落地步驟
1. 整包 clone `PokeAPI/sprites`，抽出 `home/` 與 `official-artwork/` 建類別資料集。
2. 用 PokeAPI 拉 metadata，建 national dex 為主鍵的對照骨架。
3. 接 52Poke / 官方台灣圖鑑補繁中欄位，完成跨語言對照表。
4. （未來若做畫面辨識）以上述 sprite 集做模型訓練／比對基準，辨識結果回查 PokeAPI metadata 做合法性驗證。
