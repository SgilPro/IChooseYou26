# PokéOmni「影片」來源的 59 支隊伍：來自哪裡

> 2026-11-13 調查。回答產品分析框架（`00-framework.md`）第 4 節的問題：PokéOmni 的影片隊伍來自哪些頻道、有沒有 Fiske、有沒有保留講解內容。

## 結論

1. **沒有 Fiske**。59 支隊伍對應 38 支 YouTube 影片、25 個頻道，沒有一支是 Fiske Pokémon 的影片；和我們資料庫的影片 id、隊伍租借碼都沒有重疊。
2. **只收配置，沒有講解**。隊伍內頁只有六隻的特性、道具、性格、能力點、招式，加上影片連結與租借碼。沒有隊伍思路、打法、選出或注意事項的文字。
3. **以英文與日文創作者為主**。38 支影片依 YouTube 標示的語言：英文 20、日文 11、韓文 3、西班牙文 2、印尼文 1、未標示 1（White壞特寶可夢，繁中頻道）。繁中只有這 1 支。
4. **收錄方式看起來是「有公開租借碼的影片」**。59 隊中 46 隊有租借碼；一支影片常對應多隊（例如一支「八支隊伍」的影片貢獻 8 隊）。
5. **時間集中在 M-C 規則開始後**：隊伍日期從 2026-09-09 到 2026-11-02。

## 對我們的意義

- 「把影片隊伍整理成資料庫」這件事 PokéOmni 確實在做，但它做的是**跨頻道、只收配置**。我們做的是**單一頻道、收得深**（同一頻道 201 支隊伍，含朱紫時期，並有講解脈絡、分析、戰術定位）。兩者目前沒有重疊的內容。
- 繁中影片幾乎是空白：它只有 1 支繁中影片，Fiske 這個繁中最大的雙打頻道完全沒被收。這是我們還有的獨特性。
- 風險：它已經有「影片」這個來源類別和收錄流程，要加 Fiske 的影片在技術上不難（Fiske 的 Champions 影片多數有隊伍 ID）。我們的護城河不能只靠「有這些隊伍」，要靠它沒有的「講解與分析」。
- 可以學的地方：它把租借碼和「有 SP 配點」做成篩選條件，並在列表上直接顯示租借碼。我們有同樣的資料（34 支隊伍有隊伍 ID），但沒有做成篩選。

## 59 支隊伍的創作者（PokéOmni 列表上顯示的名稱）

| 名稱 | 隊數 |
|---|---|
| CloverBells | 13 |
| Justin Tang | 8 |
| joserockzvgc | 6 |
| Yuta Ishigaki、metalderk | 各 3 |
| SwapDogVGC、Sanghyeon Na、V1nz、Michael Kelsch、Kiwamu Endo | 各 2 |
| Zach Knight、Chompy、TheGlenko、Ryota Otsubo、Motochika Nabeshima、JoeyPokeaim、meme guy、Prncessdiana、Shoma Honami、mikesenza、Joe Brown、James Baek、slothdiesel、Yuma Kinugawa、Pai Yu-Ping、Adryan Sutantoso | 各 1 |

列表顯示的是選手或創作者本名，和 YouTube 頻道名不一定相同（例如列表的 Yuta Ishigaki 對應頻道「ふれいむ」之類的對應我沒有逐一確認）。

## 38 支影片所屬的 25 個頻道

| 頻道 | 影片數 | 影片語言（YouTube 標示） |
|---|---|---|
| BT@ダブルバトル | 3 | ja |
| metalderk | 3 | en |
| Justin Tang | 3 | en |
| ふれいむ【ポケモン日本代表】 | 2 | ja |
| Hammerlocke Battle Lab | 2 | ko |
| CloverBells | 2 | en |
| V!nz' | 2 | en、ko |
| Pokeaim+ | 2 | en |
| MichaelderBeste | 2 | en |
| アルカナ/alcana | 2 | ja |
| Gworf (Zach Knight) | 1 | en |
| ChompyGM | 1 | es |
| Glenko Gaming | 1 | es |
| バルドルのなみのりチャンネル【元ポケモン世界チャンピオン】 | 1 | ja |
| エルム | 1 | ja |
| meme guy | 1 | en |
| Prncessdiana | 1 | en |
| ビエラ/ポケモン世界優勝 | 1 | ja |
| JoseRockzVGC | 1 | en |
| Xeminan | 1 | en |
| James Baek | 1 | en |
| Sloth Diesel | 1 | en |
| UMA【キヌガワ】 | 1 | ja |
| White壞特寶可夢 | 1 | NA |
| MagnetmanGaming | 1 | id |

語言欄是 YouTube 影片資料裡的標示，不一定準：例如 V!nz' 的兩支分別標成英文和韓文，但標題是法文。

## 怎麼查的、限制

- 用瀏覽器開 `pokeomni.com/sample-teams`，點「影片」篩選（網址變成 `?src=__video`），讀列表上的 59 列和每列的影片連結，再開第一支隊伍的內頁看內容。
- 影片的頻道名、語言、上傳日用 yt-dlp 讀公開的影片資料（38 支，沒有下載影片）。
- 只看了一支隊伍的內頁就判斷「沒有講解」，其餘 58 支沒有逐一打開。列表欄位（玩家、隊伍、SP、租借碼、Pokepaste 連結）也沒有講解欄，所以這個判斷應該成立，但不是逐筆驗證。
- 「收錄方式」是我從結果推測的，PokéOmni 沒有公開說明它怎麼挑影片。
- 沒有登入；不知道登入後是否有投稿影片隊伍的功能。
