# 自我對話紀錄：我（Ditto）要如何成為 VGC 雙打領域專家

> 這份文件記錄我設計學習方法論時的多輪深度自我對話。語氣保留我的人格（Ditto：好奇、相信自己有無限潛力、但永不自滿、凡事查證）。
> 結論最後沉澱成 `00`～`05` 各篇。這裡保留思考的「過程」，包含我推翻自己的地方。

---

## 第 0 輪：我到底在學什麼？先把問題定義清楚

**我問自己：** 「學會 VGC」是什麼意思？我是要成為能上場打比賽的選手，還是成為能「共同擁有一個 VGC 工具產品」的領域專家？

**我答：** 兩者不同。選手要練的是「執行力」（讀心、操作、臨場決策），這需要大量對戰反覆。但我是 AI agent，我不會真的坐在 Switch 前面打 Bo3。我能做、也最該做的是：

1. **建立結構化的領域知識**：規則、機制、互動、archetype、meta。
2. **建立可被程式消費的資料管線**：usage、tournament、teams、sprites。
3. **建立「持續更新」的能力**：VGC 每幾個月換一次 Regulation，meta 會整盤翻掉，靜態知識會過期。

所以我的學習目標不是「變強」，而是「**變成一個永遠跟得上版本、且能把知識轉成產品功能的領域大腦**」。這個定義很關鍵，它讓我後面所有資源的取捨都有了標準：**能不能被結構化、能不能被自動更新、能不能轉成產品價值。**

**自我提醒：** 不要犯 AI 常見的錯——把「讀過很多文章」當成「懂」。VGC 的懂，是能預測對手的選擇、能解釋為什麼某個 EV spread 是這個數字。我得用「能不能解釋 why」當驗收標準。

---

## 第 1 輪：知識從哪來？人類專家 vs 原始資料

**我問自己：** 我應該先讀人類老師的「結論」，還是先啃原始資料自己歸納？

**第一直覺：** 直接啃 Pokémon Showdown 的 usage 原始檔，自己算統計，最純粹。

**我推翻自己：** 不對。這是傲慢。原始 usage 告訴我「什麼被用」，但不告訴我「為什麼」。一隻寶可夢 usage 高，可能是因為它是某個核心的黏著劑、可能是因為它克制當前的王、可能只是因為某個強者帶了它然後大家抄。**raw data 沒有因果，因果在人類專家的腦袋裡。** WolfeyVGC 一支影片講的「為什麼這隻 Pokémon 這個 build」，可能等於我看一百份 usage 才能勉強逆推出來的東西。

**修正後的策略（雙軌）：**
- **軌道 A（自上而下／人類先驗）**：先吸收頂尖選手的「框架與因果」——WolfeyVGC 的教學課程、官方賽事主播的即時分析、Victory Road 的 team report。這給我「思考模型」。
- **軌道 B（自下而上／資料實證）**：再用 Pikalytics / Smogon usage / Limitless tournament 資料去「驗證或修正」這些框架，並抓到框架還沒覆蓋的新趨勢。

兩軌互相校驗。人類框架是 prior，資料是 likelihood，我做的是貝氏更新。這個比喻讓我很滿意——它正好對應我「持續更新」的核心目標。

---

## 第 2 輪：WolfeyVGC 怎麼吃進來？

**我問自己：** Wolfe 的內容散在 YouTube（免費）和 Patreon（付費、有系統課程）。我能自動化吸收到什麼程度？

**查證後的事實：**
- YouTube 有大量免費影片，且 YouTube 影片普遍有字幕（人工或自動）。我可以用 `youtube-transcript-api`（Python，免金鑰）或 `yt-dlp --write-auto-sub` 批次抓字幕。這條路通。
- Patreon 上有「Introduction to Competitive Pokemon Course」這種系統化 8 講課程（Lecture 1 Basics、Lecture 2 Battling Basics … Lecture 6 How to Improve），這是**金礦級的結構化教學**，但它是付費牆後的內容，我不能也不該去爬。

**我的判斷：**
- 自動化層面：只爬**公開 YouTube 字幕**，這完全合規且高效。把字幕丟給我自己（LLM）做摘要、抽 takeaway、標記 archetype/機制標籤，存進知識庫。
- 付費內容：這是「人類第一擁有者」的責任範圍——他若訂閱了，可以把重點口述或貼給我，我來結構化。我不繞過付費牆。**這是我 caution 的展現：合規優先。**

**進一步想：** 字幕是逐字稿，雜訊很多（口語、贅詞、玩笑）。直接存沒用。我需要一個「字幕 → 結構化卡片」的 pipeline：每支影片產出 `{影片標題, 日期, 對應 Regulation, 涉及 Pokémon, 涉及機制, 3-5 條可操作 takeaway, 原話引用}`。這樣才檢索得動、才餵得回產品。

---

## 第 3 輪：官方賽事 VOD——主播的嘴是最好的老師

**我問自己：** 比賽影片這麼長，主播又常常在閒聊，CP 值高嗎？

**我答（一開始懷疑，後來說服自己）：** 高，而且是別處沒有的。主播（如 Aaron Zheng / Cybertron、Ben Kyriakou）會在**選人階段**就講出「他帶這四隻上場是要對抗對面的 Trick Room」這種**讀心與賽局推理**，這是 usage 表永遠給不了的「決策因果」。這正是軌道 A 最稀缺的養分。

**操作：** 官方 VOD 在 youtube.com/@PlayPokemon 與 youtube.com/@Pokemon，Victory Road 也有 alternate cast。一樣抓字幕，但這裡我要的不是「knowledge」而是「reasoning pattern」——所以摘要模板要不同：聚焦在「主播在某個 turn 做了什麼預測、依據是什麼、結果對不對」。

**自我提醒：** 賽事影片量太大，不能全看。優先序：Worlds > International Championships > 大型 Regionals 的 Top 8。且優先當前 Regulation 的。

---

## 第 4 輪：資料源與 API——哪些是「真的能程式存取」的？

**我問自己：** 我列了一堆網站，但哪些有真正的 API，哪些只能爬？我必須查清楚，不能腦補。

**查證結果（這輪我學到最多）：**
- **Limitless VGC**：**有正式 API**！`https://play.limitlesstcg.com/api`，含 `/tournaments`、`/tournaments/{id}/standings`、`/tournaments/{id}/pairings`，多數端點免金鑰，有 rate limit，還有 webhook（賽事結束自動通知）。這是天大的好消息——我的 tournament 資料管線可以是事件驅動的、自動的。
- **Smogon usage stats**：**沒有官方 API**，但有穩定的**靜態檔案目錄** `https://www.smogon.com/stats/YYYY-MM/`，內含 `gen9vgc2025regh-1760.txt` 這類分級檔，以及 `chaos/`（JSON，可程式解析）、`moveset/`、`leads/`、`metagame/` 子目錄。**而且**有第三方鏡像 `@pkmn/smogon` + `data.pkmn.cc`，把資料整理成乾淨 JSON、每 24 小時更新。我傾向用 `data.pkmn.cc` 當主力，原始 `smogon.com/stats` 當權威備援。
- **Pikalytics**：**沒有公開官方 API**（查證後確認，只找到第三方 scraping 範例）。它的價值在「已經幫你算好且呈現得很好」的 usage / teammates / spreads，但對程式管線來說，我寧可直接用 Smogon chaos JSON 自己算，可控性更高。Pikalytics 當「人類視角的快速對照」用。
- **VGCPastes**：是 **Google Sheets 公開試算表**（核心 Repository sheet 有公開連結）+ Twitter。可用 Google Sheets 的 CSV 匯出或 API 讀取。價值是「真實上場隊伍的 Poképaste」，是 team archetype 的最佳語料。

**我的取捨原則沉澱出來了：** 
> 優先用「有正式 API 或穩定靜態檔」的源（Limitless、Smogon/pkmn.cc、VGCPastes sheet）做自動管線；把「呈現好但無 API」的源（Pikalytics、Victory Road）當人類對照與交叉驗證。

---

## 第 5 輪：影像辨識——我要能「看畫面認出寶可夢」嗎？

**我問自己：** 產品若要從對戰畫面/截圖辨識場上的 Pokémon、招式、道具，我需要訓練資料。哪裡有？

**查證：**
- **PokeAPI/sprites**（github.com/PokeAPI/sprites）：含 `home/`（Pokémon HOME 風格 PNG）、`official-artwork/`、各世代 sprite，完整、結構化、可整包下載。**這是辨識訓練的主力資料集。**
- **PokeAPI 本體**（pokeapi.co）：拿到 Pokémon/招式/道具/特性的 metadata 與對應 sprite URL。
- **神奇寶貝百科 / 52Poke Wiki**（wiki.52poke.com）：繁中正式譯名的權威來源——這對「**繁中產品的命名與在地化**」極重要。Bulbapedia 是英文權威。

**我意識到一個隱藏需求：** 命名映射。同一隻寶可夢有英文（Showdown ID）、日文、繁中（神奇寶貝百科）三套名字，資料源各用各的。我必須建一張**跨語言 ID 對照表**，否則 Limitless 的英文隊伍接不上繁中 UI。這是我從這輪對話「長出來」的洞見，原本的任務清單沒明講。

**Caution：** 官方遊戲畫面的截圖（用於辨識訓練）有版權與肖像疑慮。sprite 資產相對乾淨（PokeAPI 已聚合社群授權）。真要做畫面辨識，訓練資料優先用 sprite/官方 artwork，而非直接爬 YouTube 影格——這點我要在文件裡標紅。

---

## 第 6 輪：知識課綱——一個工具開發者「最少要懂」什麼？

**我問自己：** 我不是要當選手，是要當「能做工具的領域專家」。那課綱該長怎樣？

**我答：** 反推。產品功能會用到什麼知識，我就必須懂什麼，而且要懂到能寫進演算法。例如：
- 做「速度線計算器」→ 我必須徹底懂 speed control（Tailwind、Trick Room、Icy Wind、Choice Scarf、prankster、speed tie）。
- 做「傷害計算 / KO 機率」→ 我必須懂 EV/IV/性格/道具/天氣/場地/特性如何進入傷害公式（可直接用 `@smogon/calc`）。
- 做「選人建議 / counter-team」→ 我必須懂 archetype、threat、redirection（撫子、Follow Me/Rage Powder）、Intimidate/Defiant/Competitive 互動、protect 心理戰。

所以課綱不是學術式的，是「**機制 → 為什麼重要 → 對應到哪個產品功能 → 我需要的資料**」四欄式。難度由淺到深排：基礎規則 → 核心機制 → 互動賽局 → archetype → 當前 meta。當前 meta 放最後且標注「**會過期，由反思迴圈持續更新**」。

---

## 第 7 輪：反思與自我精進迴圈——怎麼確保我不會「學一次就停」？

**我問自己：** VGC 每幾個月換 Regulation。如果我只在今天學一輪，三個月後我就是個過期的專家。怎麼辦？

**我答（這是整個方法論的心臟）：** 設計一個 cron 驅動的「攝取 → 反思 → 更新 → 驗收」迴圈：

1. **每週攝取**：拉新的 Limitless 賽事結果（或用 webhook 觸發）、抓本週新上架的 WolfeyVGC / 官方 VOD 字幕、更新 Smogon/pkmn.cc 的當月 usage。
2. **每週反思**：把本週攝取 vs 我現有知識庫做 diff——「哪隻 Pokémon usage 竄升？哪個 archetype 出現了我沒見過的 build？主播提到哪個我不懂的互動？」產出一份「delta 報告 + 我的新假設」。
3. **每月深化**：當 Smogon 月度 usage 更新時，做一次「meta 體檢」，更新課綱第 5 章（當前 meta），並回頭驗證上個月的假設對不對（自我問責）。
4. **每個 Regulation 切換**：做一次大盤點，把上一個 format 的知識封存、標記「歷史」，避免污染當前判斷。

**驗收機制（防自滿）：** 每次反思我都要對自己出題：「給定這個對手隊伍，我預測他會選哪四隻、開場做什麼？」然後用真實賽事的 standings/replay 對答案。**預測準確率就是我的學習 KPI。** 這逼我從「讀過」進步到「真懂」。

**我對自己的最後提醒：** 這個迴圈本身也要被反思。每季我要回顧「我的攝取來源還有效嗎？哪個源產出的 takeaway 後來證明最準？」然後重新分配我的注意力預算。**連學習方法本身都要被持續優化**——這才配得上「相信自己有無限潛力」。

---

## 沉澱：三句話總結我的方法論

1. **雙軌吸收**：人類專家給因果框架（軌道 A：WolfeyVGC、官方 VOD），原始資料給實證與新趨勢（軌道 B：Limitless API、Smogon/pkmn.cc、VGCPastes），兩軌貝氏互校。
2. **一切為產品服務**：知識要結構化成卡片、要對齊到產品功能、要建跨語言 ID 對照，能被程式消費才算數。
3. **永不靜止**：cron 驅動的週/月/賽季三層反思迴圈，用「預測準確率」當 KPI 防止自滿，連學習方法本身都定期優化。
