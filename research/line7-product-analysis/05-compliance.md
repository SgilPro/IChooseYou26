# 法遵線：我們用了哪些資料與素材、來源怎麼規定、別人怎麼處理

> **2026-11-13 更新**：站主已決定把會員限定影片的內容下架。目前版控與網站上，會員影片的隊伍只留標題與影片連結，描述、章節、字幕切片、比賽規格都已移到本機的 `private/`。git 歷史尚未清理。下文描述的是下架前的狀態。

> 調查日期：2026-11-13。
> **這份是事實整理與待確認問題，不是法律意見。** 我不是律師。文中的「風險：低／中／高」是我依條款文字與同類網站做法給的粗略判斷，用來排優先順序，不代表合法或違法的結論。要對外公開或收錢之前，第 4 節的問題應該請教專業人士。

## 方法與限制

- 先讀 repo 內的背景文件（`00-framework.md`、`01`、`02`、`assets/README.md`、`tools/yt/README.md`、`research/line5-platform-backend/00-action-plan.md`），再實際檢查 repo 與部署設定，確認我們公開了什麼。
- 外部條款用網頁擷取工具讀官方頁面；會動態產生內容的站（victorpoke、PokéOmni、TrainerOps）用無頭瀏覽器開聲明頁讀畫面文字。每站只開聲明頁，沒有登入。
- 引用分兩種：標「原文」的是頁面上的字句；標「摘要」的是我的轉述。網頁擷取工具有時只回傳片段，這類我標為摘要。YouTube 條款、GitHub Sponsors 地區名單、PokeAPI sprites 授權檔、Pokémon Champions 影片指引這四項，我另外下載頁面逐字核對過。
- 擋自動存取的頁面沒有繞過，列在文末「沒能確認的事項」。
- 沒有查台灣智慧財產局的商標資料庫，沒有查任何法院判決。

## 0. 先講結論

1. **風險最高的是「會員限定影片的內容已經公開在我們網站上」。** `teams.json` 有 284 支隊伍標為會員限定，其中 136 支有完整配置、127 支有講解摘要、34 支有租借碼，網站直接顯示並提供整份 JSON／CSV 下載。YouTube 付費服務條款要求付費內容只供個人非商業使用，而這些內容是創作者收費提供的福利。這一項同時牽涉條款、著作權、和創作者的關係，三者都不利。
2. **「影格與逐字稿不公開」這個前提只對了一半。** 影格確實沒進版控。但字幕切片 `intro/*.txt` 有 138 個檔案（約 870 KB，其中 2 個來自會員影片）在公開的 GitHub repo 裡；`videos.json` 還含 584 支影片的完整描述欄（約 28.5 萬字元，其中 206 支是會員影片），而且網站上有下載連結。
3. **圖像與 logo 是第二層風險。** 寶可夢官方插畫我們存了一份放在自己的站上（約 45 MB），來源 repo 的授權檔寫明圖像著作權屬 The Pokémon Company。站台 logo 直接用大師球，文字商標的字裡也嵌了精靈球。同類網站裡，victorpoke 明寫「本站不使用官方 Logo」。
4. 名稱與數值、Showdown／@pkmn 的資料、圖示庫（lucide、tabler）風險低，補上授權聲明即可。
5. 我們目前沒有任何條款頁、隱私頁、聯絡方式或下架管道；非官方聲明只在兩個頁面的頁尾小字。三個中文同類站都有獨立的聲明頁與聯絡信箱。

## 1. 資料與素材盤點

### 總表

| # | 項目 | 我們怎麼用 | 風險 | 一句話理由 |
|---|---|---|---|---|
| 1.1 | 寶可夢名稱、種族值、招式等數值 | PokeAPI 的中文譯名對照表、`@pkmn/dex` 驗證名稱 | 低 | 屬於事實與資料，各站都在用 |
| 1.2 | 寶可夢圖像、道具與屬性圖示 | 從 PokeAPI sprites 下載後放在自己站上 | 中 | 圖像著作權屬 The Pokémon Company，沒有授權，只是普遍被容忍 |
| 1.4 | Pokémon Showdown／@pkmn | 程式套件與資料 | 低 | MIT 授權 |
| 1.5a | YouTube 公開影片的標題、連結、章節 | 用 yt-dlp 讀取後公開成表 | 低到中 | 內容是事實與連結；取得方式與條款文字不合 |
| 1.5b | 影片描述全文、字幕切片 | 在公開 repo 與網站下載檔裡 | 中到高 | 是創作者的文字與口述內容的原樣複製 |
| 1.5c | 影片裡的隊伍配置 | 從字幕與影格整理成資料 | 低到中 | 配置本身偏事實；取得過程下載了片段 |
| 1.5d | 講解摘要與分析 | 把創作者的講解改寫成站內文字 | 中 | 取決於改寫幅度與是否取代原影片 |
| 1.5e | 會員限定影片的上述內容 | 同上，並標「會員」後公開 | **高** | 付費內容被整理後免費公開 |
| 1.6 | 選手姓名與隊伍 | 賽事頁 64 位選手、隊伍作者 172 個名字 | 低到中 | 來自公開轉播，但姓名是個人資料 |
| 1.7 | pokepast.es、Limitless | 匯入 129 支隊伍的 paste；Limitless 目前沒有抓 | 低 | 沒有條款禁止；內容是玩家公開分享 |
| 1.8 | lucide、tabler 圖示；Liquipedia 圖檔；52poke 色碼 | 角色標籤圖示；兩張遊戲標誌；18 個色碼 | 低／中／低 | 圖示庫要保留授權聲明；Liquipedia 圖檔不該上站 |
| 1.9 | 大師球 logo、文字商標、站名 | 站台識別與 favicon | 中到高 | 把他人的設計當成自己的招牌用 |
| 1.10 | 公開 repo 本身 | GitHub 公開、沒有授權檔 | 中 | 上面各項都因此對外可見 |

（1.3 是官方政策整理，不是我們使用的素材，所以不在表內。）

### 1.1 寶可夢名稱、數值

**我們怎麼用**：`data/ref/names_zh-Hant.json`（寶可夢、招式、特性、道具的繁中名稱）來自 PokeAPI；`app/` 與 `tools/yt/validate-teams.mjs` 用 `@pkmn/dex` 檢查名稱與能力值。

**來源條款重點**
- PokeAPI 的程式與資料專案採 BSD-3-Clause 授權，授權檔寫明（原文）：「Pokémon and Pokémon character names are trademarks of Nintendo.」<https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md>
- PokeAPI 的合理使用政策（原文）：「Locally cache resources whenever you request them.」並說明它「is primarily an educational tool」，違反者的 IP 會被永久封鎖。<https://pokeapi.co/docs/v2>
- 台灣著作權法第 10-1 條（原文）：「依本法取得之著作權，其保護僅及於該著作之表達，而不及於其所表達之思想、程序、製程、系統、操作方法、概念、原理、發現。」<https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0070017&flno=10-1>
- 台灣商標法第 36 條第 1 項第 2 款（原文節錄）：「表示商品或服務之使用目的，而有使用他人之商標用以指示該他人之商品或服務之必要者。但其使用結果有致相關消費者混淆誤認之虞者，不適用之。」<https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0070001&flno=36>

**風險判斷：低。** 名稱與數值是在說明「這是哪隻寶可夢、能力多少」，五個對標站全部這樣用。我們已經照 PokeAPI 的要求做本機快取。

**待確認**
- 官方中文譯名整份對照表（數千筆）算不算受保護的編輯著作，我沒有查到明確說法。
- 網站上沒有寫出 PokeAPI 是資料來源（只有頁尾提到圖像）。

### 1.2 寶可夢圖像、道具與屬性圖示

**我們怎麼用**：`assets/pokemon/art/`（官方插畫 475px，約 45 MB）、`thumb/`（128px）、`assets/items/`（320 個道具圖示）、`assets/types/`（屬性圖示）都是從 PokeAPI 的 sprites repo 下載後存一份，部署時一起上站。`team.html` 與 `teams.html` 頁尾有一行小字註明來源與「本站為非官方粉絲網站」。

**來源條款重點**
- sprites repo 的授權檔開頭（原文）：「All image contents within are Copyright The Pokémon Company. This repository is distributed under CC0 1.0 Universal」。<https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt>
  也就是說，CC0 涵蓋的是「整理成這個 repo」這件事，圖像本身的著作權仍屬 The Pokémon Company。PokéOmni 的致謝頁也是這樣寫的：「圖像 © The Pokémon Company · 素材彙整 CC0」。
- **要更正我們自己的文件**：`assets/pokemon/README.md`、`assets/items/README.md`、`assets/types/README.md` 都寫 sprites repo「沒有明確授權（GitHub 顯示 NOASSERTION）」。GitHub 顯示 NOASSERTION 是因為授權檔開頭多了一行著作權聲明，自動辨識不出來；實際上有授權檔，內容如上。結論不變（圖像沒有被授權給我們），但描述應改正。

**風險判斷：中。** 沒有任何文件授權我們使用這些圖。實務上五個對標站都放寶可夢圖像，其中 Serebii 與 Pikalytics 還放廣告，多年沒有被公開追究的紀錄，但這是「被容忍」不是「被允許」。兩點會讓我們比別人更顯眼：我們放的是大尺寸官方插畫而不是小像素圖；圖檔是存在自己站上而不是連到別處。

**待確認**
- 改用小像素圖、或完全不放圖只用文字與自繪色塊，對使用體驗的影響有多大（line5 的 D4 還沒決定）。
- Champions 新增的型態圖從哪裡來；如果是從遊戲畫面裁切，會落到 1.3 的官方指引「只切出遊戲元素散布」的禁止事項。

### 1.3 The Pokémon Company 與任天堂的公開政策（背景）

我找到五份相關的官方文件，**沒有一份是針對「粉絲資料網站」的政策**。

| 文件 | 涵蓋什麼 | 和我們有關的重點 |
|---|---|---|
| pokemon.com Legal 頁 <https://www.pokemon.com/us/legal/> | 著作權與商標聲明；一段關於粉絲創作（Fan Art）的文字 | 該段的意思是：散布以寶可夢為基礎的衍生作品，等於給官方一個免權利金的全球授權；而官方使用粉絲作品，不代表創作者取得「beyond a personal, noncommercial home use」（原文片段）以外的任何權利（其餘為摘要）。**沒有粉絲網站專章，也沒有授權聯絡方式。** |
| pokemon.com 使用條款（2023-06-15 更新）<https://www.pokemon.com/us/legal/terms-of-use> | 官方網站與服務的使用 | 內容只限「for personal, noncommercial home use only」（原文）；禁止「Download quantities of content to a database for any reason」（原文）。這管的是從官方網站拿東西，我們沒有從那裡取資料。 |
| 日本官方站「ご利用について」<https://www.pokemon.co.jp/rules/> | 日本官方網站的使用 | 摘要：站上資料只許可個人欣賞用，不得複製、張貼、散布，也不得用在其他公開網路上；連結請用文字連結。頁面沒有提到粉絲網站。 |
| **Pokémon Champions 影片與靜態圖利用指引**（2026-04-08 生效）<https://www.pokemonchampions.jp/ja/streaming_guideline/> | 玩家擷取的 Champions 遊戲影像與截圖 | 見下方。這是最接近我們情況的官方文件。 |
| 任天堂的網路服務著作物利用指引（2024-09-02 更新）<https://www.nintendo.co.jp/networkservice_guideline/en/index.html> | 任天堂持有著作權的遊戲的影片與截圖 | 只適用個人；原文：「Other forms of monetization of our intellectual property for commercial purposes are not permitted.」頁面沒有提到寶可夢是否適用，也只談影片與圖片分享網站。 |

**Pokémon Champions 影片與靜態圖利用指引的重點**（已逐字核對日文原文）
- 可用範圍：開頭的限定語是「非営利目的に限り」（日文原文，意思是「限非營利目的」）；整句的意思是，限非營利目的，可以把 Champions 的影片與靜態圖貼到包含影片分享網站在內的網站或社群平台（摘要）。
- 營利的例外（摘要）：只有使用影片或圖片分享平台（舉例 YouTube、X）正式提供的功能時，才可以營利。
- 禁止事項之一（摘要）：只把遊戲的元素（插畫、音樂等）切出來散布，或製作影片與靜態圖以外的衍生作品（遊戲、應用程式等）。
- 禁止事項之一（摘要）：違反事實地宣稱或讓人誤以為受到官方協助或贊助。
- 適用範圍（摘要）：只適用於 Champions 這款遊戲，其他寶可夢內容不在範圍內；官方不回覆個別詢問或授權申請。
- 違反時（摘要）：官方可能要求下架或採取法律措施。

**這對我們的意義**
- 創作者把 Champions 的對戰錄成影片上傳，是在這份指引的範圍內。
- 我們目前**沒有公開任何遊戲截圖**，所以這份指引既沒有涵蓋我們，也沒有被我們違反。但它透露了官方的態度：預設非營利；營利只限平台內建功能；不要把遊戲元素單獨切出來散布。
- 如果之後 Game Log 或隊伍頁要放對戰截圖，要回來對照這份指引。

另外，同一個官方網站還有活動舉辦指引 <https://www.pokemonchampions.jp/ja/event_guideline/>，摘要：限非營利活動；不得從贊助商等第三方收取物品、服務或金錢；可以收用來補貼場地等營運費用的報名費（2026-04-17 追加）。這和 06 文件的捐款問題有關。

### 1.4 Pokémon Showdown／@pkmn

**我們怎麼用**：`@pkmn/dex` 套件做名稱與型態對照；匯出隊伍時用 Showdown 的文字格式。

**來源條款重點**：兩者都是 MIT 授權。MIT 的條件（原文）：「The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.」<https://github.com/smogon/pokemon-showdown/blob/master/LICENSE>、<https://github.com/pkmn/ps/blob/main/LICENSE>

**風險判斷：低。**

**待確認**：`app/` 打包後的檔案有沒有保留授權聲明（多數打包工具預設會留，我沒有檢查產出檔）。Showdown 的寶可夢小圖來源它自己的致謝頁寫的是社群擷取（<https://pokemonshowdown.com/credits>），我們沒有用它的圖。

### 1.5 YouTube 影片的資訊、字幕、畫面

**我們怎麼用**（依 `tools/yt/README.md` 與實際檢查）
- 用 yt-dlp 讀頻道的影片清單、每支影片的資料與字幕，不下載整支影片。
- 隊伍介紹段會下載該段影片再抽影格；比賽播報影片會下載 360p 整支到 repo 外的暫存目錄找隊伍表，再下載 720p 短片段抽影格。
- 會員限定影片用站主自己的會員帳號匯出的 cookies 讀取。
- 公開出去的東西：`videos.json`（標題、連結、觀看數、章節、**描述全文**、置頂留言 2 筆）、`teams.json`（配置、講解摘要、分析、租借碼）、公開 repo 裡的 `intro/*.txt`（字幕切片）。影格沒有進版控。

**YouTube 服務條款**（台灣版，生效日 2022-01-05，已逐字核對）<https://www.youtube.com/static?template=terms&hl=zh-TW&gl=TW>
- 原文：「您可以基於個人用途 (非商業目的) 觀看或聆聽「內容」，也可以透過嵌入式 YouTube 播放器播放影片。」
- 禁止事項，原文：「存取、重製、下載、發布、傳輸、播送、顯示、出售、授權、修改、變更或以任何其他方式使用本「服務」的任何部分或任何「內容」，除非您 (a) 取得本「服務」的明確授權；或是 (b) 取得 YouTube 和相關著作權人 (如適用) 的事先書面許可。」
- 禁止事項，原文：「以任何自動化工具 (如機器人、殭屍網路或網路爬蟲) 存取「服務」，除非您 (a) 在公開的搜尋引擎中依循 YouTube 的 robots.txt 檔案進行搜尋；或是 (b) 取得 YouTube 的事先書面許可。」
- 創作者給其他使用者的授權，原文：「為免疑義，此授權並不授予或許可任何使用者在獨立於本「服務」之外的情況下使用您的「內容」。」
- 準據法是美國加州法律。

**YouTube 付費服務條款**（頻道會員屬於付費服務，已逐字核對）<https://www.youtube.com/t/terms_paidservice?hl=zh-TW&gl=TW>
- 原文：「您可以依據前述條款和法律規範，以個人名義將該付費服務用於非商業用途。」
- 原文：「您同意無論是否收費，都不會公開展示任何付費服務的全部或部分內容，除非此舉不構成著作權侵害。」
- 禁止事項，原文：「將付費服務內容複製、販售、租賃或轉授權給任何第三方」。

**YouTube API 開發人員政策** <https://developers.google.com/youtube/terms/developer-policies>
- 我們沒有用官方 API，所以這份政策目前不直接約束我們。但如果之後改用 API，要注意兩條（原文片段）：不得「scrape YouTube Applications」；儲存的資料「After 30 calendar days, the API Client must either delete or refresh the stored data.」

**頻道會員政策頁** <https://support.google.com/youtube/answer/7636690?hl=zh-Hant>：這頁規範的是頻道主可以提供哪些福利，**沒有**寫到會員（觀眾）能不能轉述或分享會員內容。相關限制在上面的付費服務條款。

**yt-dlp 的條款風險**：yt-dlp 是工具，本身沒有服務條款。風險在於用它做的事對上 YouTube 條款的兩句話：「自動化工具存取」與「下載」。只讀公開的影片資料與字幕，是許多研究與社群工具的普遍做法，但條款文字上沒有例外。另外，`tools/yt/README.md` 自己就記著帳號風險：用瀏覽器 cookies 可能讓帳號被標記。被處置的會是站主的 Google 帳號。

**創作者的著作權與「合理使用」**

影片裡受保護的是什麼：創作者的口述講解（語文著作）、投影片與剪輯（視聽著作的一部分）。隊伍配置（哪六隻、帶什麼招式）比較接近事實或想法，依第 10-1 條不在保護範圍；但「為什麼這樣配、怎麼打」的講解是表達。

台灣著作權法第 65 條第 2 項列出判斷合理使用要看的四件事（原文）<https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=J0070017&flno=65>：
1. 「利用之目的及性質，包括係為商業目的或非營利教育目的。」
2. 「著作之性質。」
3. 「所利用之質量及其在整個著作所占之比例。」
4. 「利用結果對著作潛在市場與現在價值之影響。」

另外兩條相關規定：
- 第 52 條（原文）：「為報導、評論、教學、研究或其他正當目的之必要，在合理範圍內，得引用已公開發表之著作。」
- 第 64 條第 1 項（摘要）：依第 52 條等規定利用他人著作，應明示出處。

**我只列出每個因素在我們這裡對應到什麼事實，不下結論：**

| 因素 | 對我們有利的事實 | 對我們不利的事實 |
|---|---|---|
| 目的與性質 | 非營利、學習用途；每筆連回原影片；加了自己的標籤與控速分級 | 若日後收捐款或放廣告，這一項會變弱；字幕切片與描述全文是原樣複製，沒有加工 |
| 著作的性質 | 公開影片已公開發表；配置偏事實 | 會員影片是付費、限定對象的內容，是否算「已公開發表」需要專業判斷 |
| 用了多少 | 配置只是影片的一小部分 | 講解摘要涵蓋了「這隊怎麼打」的核心；字幕切片是介紹段的完整逐字稿 |
| 對市場的影響 | 公開影片：我們把人導回影片 | 會員影片：看了我們的整理就不必加入會員，直接取代付費福利 |

**風險判斷**
- 公開影片的標題、連結、章節時間（1.5a）：低到中。
- 描述全文與字幕切片（1.5b）：中到高。這兩項是原樣複製，而且網站功能其實不需要它們公開。
- 隊伍配置（1.5c）：低到中。
- 講解摘要與分析（1.5d）：中。這正是我們的差異化所在（見 `02-team-library-scoring.md`），所以更需要創作者知情。
- 會員限定內容（1.5e）：**高**。

**待確認**
- repo 與文件裡**沒有找到已告知或取得 Fiske 同意的紀錄**。這是最該先做的事。
- `teams.json` 標會員限定的 284 支隊伍裡，有 72 支對應的影片在 `videos.json` 沒有標會員限定，兩個檔案要對帳。
- 置頂留言欄位目前只有 2 筆且都是頻道主自己的留言；如果之後抓到觀眾留言，會多出個人資料問題。

### 1.6 選手的隊伍配置與姓名

**我們怎麼用**：`data/events/*.json` 有 9 場賽事、64 位選手的本名與隊伍，來源是官方賽事轉播畫面（經 Fiske 的播報影片）。`teams.json` 的作者欄有 172 個不同的名字。

**相關規定**（個人資料保護法，頁面顯示修正日期民國 114 年 11 月 11 日）<https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021>
- 第 2 條第 1 款把「姓名」與「社會活動」列為個人資料（摘要）。
- 第 19 條第 1 項（摘要）：非公務機關蒐集個人資料要有特定目的，並符合所列情形之一，其中包括當事人自己公開的資料，以及取自一般可得來源的資料。第 2 項（摘要）：當事人表示禁止利用時，應刪除或停止利用。
- 第 51 條第 1 項第 1 款（摘要）：自然人為單純個人或家庭活動目的而蒐集、利用，不適用本法。

**風險判斷：低到中。** 選手是在公開賽事、公開轉播上出現，隊伍表是官方公布的；Limitless、Pikalytics、TrainerOps、PokéOmni 都列選手姓名。但公開網站大概不算「單純個人活動」，所以應該準備好「選手要求就移除」的管道。

**待確認**
- 部分選手是歐盟居民，歐盟的個資規範（GDPR）是否適用到我們這樣的個人網站，我沒有查。PokéOmni 的隱私頁同時提到台灣個資法與 GDPR。
- 未成年選手（青少年組）目前資料裡有沒有，我沒有逐筆檢查。
- 官方賽事規則是否寫明參賽者同意姓名與隊伍被公開，我搜尋後沒有找到明確條文。

### 1.7 pokepast.es、Limitless 等第三方

**我們怎麼用**：`tools/yt/import-pokepaste.mjs` 從影片描述裡的 pokepast.es 連結，用 `/json` 讀隊伍，共 129 支。Limitless 目前程式裡沒有抓取，只出現在規劃文件。

**來源條款重點**
- pokepast.es 首頁沒有任何使用條款、著作權或隱私聲明（已讀首頁確認）<https://pokepast.es/>。它的程式是 BSD-3-Clause 授權，這管的是程式不是使用者貼的內容 <https://github.com/felixphew/pokepaste/blob/v3/LICENSE>。
- Limitless 的 API 文件（原文）：「you do NOT need an API key to access the API.」金鑰只發給「public-facing projects that have a legitimate use-case」；有速率限制；**沒有寫署名要求或商業使用規定**。<https://docs.limitlesstcg.com/developer.html>
- Limitless 服務條款（2021-02-28 更新）對使用者投稿內容的說法（原文）：「You retain any and all of Your rights to any Content You submit, post or display on or through the Service.」條款沒有談自動存取或資料再利用。<https://play.limitlesstcg.com/tos>

**風險判斷：低。** paste 是創作者自己公開貼出、並放在影片描述裡的。

**待確認**：之後若接 Limitless（line5 的 Phase 3），沒有明文條款不等於可以任意使用；三個中文站都有標明來源並連回，照做即可。

### 1.8 圖示庫、Liquipedia 圖檔、52poke 色碼

| 素材 | 來源條款 | 風險 | 該做的事 |
|---|---|---|---|
| lucide 圖示（13 個） | ISC 授權，條件是著作權聲明與許可聲明要「appear in all copies」（原文）；部分圖示源自 Feather，採 MIT <https://lucide.dev/license> | 低 | 目前 SVG 內嵌在 `data/ref/roles.json`，沒有附授權聲明。在致謝頁列出即可 |
| tabler 圖示（1 個） | MIT <https://github.com/tabler/tabler-icons/blob/main/LICENSE> | 低 | 同上 |
| Liquipedia 圖檔（`assets/games/champions.png`、`sv.png`） | 版權頁對自動存取回 403，**未能確認**。搜尋結果顯示它的說明頁寫文字採 CC BY-SA 3.0，圖片與媒體不在此授權內，且不鼓勵再利用（摘要，來自搜尋結果，未讀到原頁）<https://liquipedia.net/commons/Liquipedia:Copyrights> | 中 | 頁面沒有用這兩張圖，但部署腳本用 `cp -r assets/games` 把它們一起放上站了。建議從部署移除 |
| 52poke 的 18 個屬性色碼 | 文字內容採 CC BY-NC-SA 3.0（非商業、相同方式分享）（摘要，原頁為簡體中文）<https://wiki.52poke.com/wiki/%E7%A5%9E%E5%A5%87%E5%AE%9D%E8%B4%9D%E7%99%BE%E7%A7%91:%E7%89%88%E6%9D%83%E5%A3%B0%E6%98%8E> | 低 | 我們只取了色碼數值。若日後營利，「非商業」條件值得留意 |

### 1.9 大師球 logo、文字商標與站名

**我們怎麼用**：`assets/master-ball-128.png` 是站台 logo 與 favicon；`assets/master-ball-wordmark-web.png` 是文字商標：左邊一顆大師球，右邊斜體粗框字「IChooseYou」，字母 o 裡各嵌一顆精靈球造型。原圖是站主提供，**來源與作者沒有紀錄**。站名「I Choose You」同時是寶可夢動畫的經典台詞與電影片名。

**查到的事實**
- 「POKÉ BALL」文字在美國有任天堂名下的註冊商標，例如 USPTO 序號 79370208 的紀錄是標準文字商標 <https://tsdr.uspto.gov/statusview/sn79370208>。
- 球的**圖形**有沒有註冊、台灣有沒有註冊：**未確認**（沒有查智慧財產局資料庫）。
- 「I Choose You」這個詞有沒有被註冊為商標：搜尋沒有找到紀錄，**未確認**。
- 就算沒有商標註冊，大師球的造型也是遊戲美術的一部分，有著作權。
- 同類站的做法：victorpoke 寫「本站不使用官方 Logo」（原文）；PokéOmni 的致謝頁承認導覽列用了球種圖示，並註明著作權屬 Nintendo／The Pokémon Company。

**風險判斷：中到高。** 1.2 的圖像是「用來指出這是哪隻寶可夢」，logo 則是「拿別人的設計當自己的招牌」。商標法第 36 條的合理使用要求「非作為商標使用」，logo 正好相反。官方指引也禁止讓人誤認受到官方協助。這一項的好處是替換成本低。

**待確認**：原圖是誰畫的（官方素材、粉絲繪圖、還是 AI 產生）；若是他人的粉絲繪圖，還有那位作者的權利。

### 1.10 公開 repo 本身

- GitHub repo 是公開的，沒有授權檔。沒有授權檔代表別人依法不能任意重用我們的東西，但所有檔案都看得到、下載得到。
- 我們不能替第三方內容（字幕、描述、圖像）授權，所以日後若要加授權檔，要把「我們自己寫的程式與分析」和「第三方內容」分開。
- cookies 檔已在 `.gitignore`（`*cookies*.txt`），這次檢查沒有在版控裡看到。
- GitHub 的使用政策禁止侵害他人智慧財產權的內容（摘要）<https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies>。權利人可以直接向 GitHub 提出下架要求；GitHub 會怎麼處理（只移除被點名的檔案，或停用整個 repo 與網站）我沒有查它的處理流程，最壞情況要假設整站受影響。

## 2. 別人怎麼處理

### 比較表

| | PokéOmni | TrainerOps | victorpoke | Pikalytics | Serebii |
|---|---|---|---|---|---|
| 聲明頁 | 關於與致謝、使用條款、隱私權政策，三頁齊全 | About、Acknowledgements、Terms、Privacy，四頁齊全 | 資料來源與版權、使用條款、隱私權政策、關於製作者，四頁齊全 | 只有外站代管的隱私權政策；未見關於、條款、致謝頁 | 隱私權政策；未見條款或致謝頁 |
| 非官方聲明 | 有，獨立一節「免責聲明」 | 有，致謝頁第一節與條款各一次 | 有，致謝頁、條款、關於頁各一次 | 未見「非官方」字樣，只有頁尾商標歸屬一行 | 首頁未見「非官方」字樣，只有頁尾兩行著作權與商標聲明 |
| 資料來源致謝 | 逐項列來源、授權、著作權人，附連結 | 逐項列來源並說明每種資料怎麼用 | 逐項列來源並說明用途 | 沒有獨立致謝；頁面文字提到 Showdown，隊伍連回 Limitless | 未見 |
| 對創作者／選手內容的說法 | 「隊伍配置歸原作者所有」 | 逐隊人工審核、連回原文、權利屬原作者、作者可要求移除 | 只談使用者自己分享的隊伍，站方可移除 | 未見 | 未見 |
| 下架或聯絡機制 | 一個信箱；明寫權利人可要求調整或移除，「會儘速處理」 | 透過社群帳號聯絡；致謝頁寫作者可聯絡移除；沒有正式流程 | 信箱與 GitHub；用於錯誤回報 | 頁尾只有「刊登廣告」的聯絡連結 | 站長信箱 |
| 準據法 | 台灣法律，中文版為準 | 中華民國（台灣）法律 | 條款未寫 | 未見 | 未見 |
| 廣告 | 隱私頁寫沒有廣告 | 未見廣告程式 | 隱私頁寫可能顯示 Google AdSense；頁面載入了 AdSense 程式 | 頁面載入了廣告程式 | 隱私頁寫廣告由 Playwire 管理 |

來源頁：
- PokéOmni：<https://pokeomni.com/about>（最後更新 2026-09-30）、<https://pokeomni.com/terms>、<https://pokeomni.com/privacy>（最後更新 2026-08-20）
- TrainerOps：<https://trainerops.app/en/about>、<https://trainerops.app/en/acknowledgements>、<https://trainerops.app/en/terms>（後兩頁最後更新 2026-11-12）
- victorpoke：<https://victorpoke-champions.com/zh-TW/credits>、<https://victorpoke-champions.com/zh-TW/terms>（最後更新 2026-05-11）、<https://victorpoke-champions.com/zh-TW/about>、<https://victorpoke-champions.com/zh-TW/privacy>
- Pikalytics：<https://www.pikalytics.com/>
- Serebii：<https://www.serebii.net/>、<https://www.serebii.net/privacy.shtml>

### 各站的寫法（值得照抄結構的部分）

**PokéOmni**
- 免責聲明（原文）：「PokéOmni 為非官方、免費的粉絲自製工具，與任天堂(Nintendo)、Creatures Inc.、GAME FREAK inc. 及 The Pokémon Company 無任何關聯，亦未獲其授權、贊助或背書。」
- 每個來源後面跟一行授權與著作權人，例如 PokéAPI 那行寫「圖像 © The Pokémon Company · 素材彙整 CC0」。
- 下架（原文）：「若你是內容權利人並希望我們調整或移除相關素材，請透過同一管道聯繫，我們會儘速處理。」
- 條款把自己定位成業餘專案，不保證可用性，並提醒使用者自行備份（摘要）。
- 隱私頁（原文）：「本站沒有廣告、不販售資料、不做跨站行為追蹤。」並提到台灣個資法與 GDPR 下的查詢、更正、刪除權利（摘要）。

**TrainerOps**
- 非官方聲明（原文）：「TrainerOps is a fan-made project and is not affiliated with, endorsed, sponsored, or specifically approved by any of them.」
- 對聚合資料的定位（原文）：「All underlying data remains the property of its source; TrainerOps only aggregates and presents it.」
- 對社群內容（部落格、貼文、影片）的說法，**這段和我們的情況最像**（原文）：「every team is reviewed by hand before it is added, credited with a link back to the original. All rights remain with the original authors — if you are an author and would like your content removed, please contact us.」
- 官方新聞只摘錄並逐則連回原文，寫明權利屬 The Pokémon Company（摘要）。
- PokéAPI 的資料事先匯入並快取，正式環境不即時呼叫（摘要）。
- 條款反過來限制別人抓它：要遵守 robots.txt、標明出處，不得整批複製或重新包裝成資料集（摘要）。

**victorpoke**
- 商標與著作權歸屬獨立成一節，並寫（原文）：「本站不使用官方 Logo，不轉載官方新聞全文；官方消息頁僅同步標題與簡短摘要，並附上原文連結」。
- 對 Game8（原文）：「本站僅整理數值資料，不轉載其文章內容。」
- 對 Showdown（原文）：「本站不使用其資料庫內容，僅遵循其公開的文字格式規格。」
- 有一節「編輯方針與資料驗證」，承諾（原文）：「不引用未經查證的數據，不虛構賽事成績，也不聲稱任何官方背書。」
- 一個落差：我們 2026-11-10 讀它的前端程式時，看到它的寶可夢大圖主要是直接連到日本官方圖鑑站（記錄在 `assets/README.md`）。它的致謝頁把圖片來源寫成 PokeAPI，沒有列官方圖鑑站。這是先前的觀察，這次沒有重新驗證。

**Pikalytics 與 Serebii**
- 兩站都只有一行式的頁尾聲明。Pikalytics（原文）：「Pokemon and All Respective Names are Trademark & © of Nintendo 1996-2026」。Serebii 另加一行（原文）：「All Content is © Copyright of Serebii.net 1999-2026.」
- 兩站都是營運多年的英文老站，聲明比三個 2026 年的中文新站簡略得多。**老站寫得少不代表新站可以寫得少**：新站沒有多年被容忍的紀錄可以倚靠。

### 我們和它們的差距

| 項目 | 三個中文站 | 我們 |
|---|---|---|
| 獨立聲明頁 | 都有 | 沒有 |
| 非官方聲明 | 聲明頁與條款 | 兩個頁面頁尾的小字 |
| 來源逐項致謝 | 都有 | 頁尾一句話，只提 PokeAPI 圖像與處理流程 |
| 聯絡或下架管道 | 都有信箱或社群帳號 | 沒有 |
| 條款與隱私頁 | 都有 | 沒有（我們目前不收集任何使用者資料，隱私頁可以很短） |

## 3. 公開原則草案（供站主決定）

每條後面括號是它對應的風險編號。

**A. 創作者內容**
1. **先告知 Fiske，取得書面（訊息也算）同意再繼續公開由影片整理的內容。** 說明我們做了什麼、公開到什麼程度、他可以隨時要求撤下。沒有回覆之前，先照第 2、3 條收斂。（1.5 全部）
2. **會員限定影片預設只公開「這支影片存在」的資訊**：標題、日期、連結、會員標記。配置、講解摘要、分析、租借碼不公開，除非創作者明確同意。同一支隊伍若另有公開來源（公開影片、創作者自己貼的 paste），用公開來源的資料並標明。（1.5e）
3. **不公開創作者文字的原樣複製。** 把 `intro/*.txt` 與 `videos.json` 的 `description`、`pinned_comment` 欄位移出公開 repo 與網站下載檔；注意 git 歷史裡仍有舊版，需要另外處理。（1.5b、1.10）
4. **講解內容用自己的話改寫、控制篇幅、每筆標「整理自某影片」並連回原片的時間點**，定位是「看影片前的導讀」而不是取代影片。（1.5d）
5. **每筆資料都有來源欄並可連回**：影片、賽事、paste。這一點我們已經做到，寫成原則是為了以後新增來源時不退步。（1.5、1.6、1.7）

**B. 下架與聯絡**
6. **設一個公開的聯絡信箱，並在聲明頁寫下架流程**：誰可以提出（創作者、選手、權利人）、我們承諾幾天內處理（建議先下架再討論）、處理後回覆。草案：收到後 3 天內把該內容從網站與下載檔移除，並回信確認。（1.5、1.6、1.9）
7. **選手可以要求移除或改用暱稱**，不需要說明理由。（1.6）

**C. 非官方聲明與致謝**
8. **新增一頁「關於、資料來源與聲明」**，每頁頁尾都連過去。內容照 PokéOmni 的結構：這個站是什麼、非官方聲明、逐項來源與授權、聯絡與下架。（1.1 至 1.9）
9. **非官方聲明放三個地方**：每頁頁尾一行、聲明頁全文、repo 的 README。建議文字：「本站是非官方的粉絲專案，與 Nintendo、Creatures Inc.、GAME FREAK inc.、The Pokémon Company 沒有任何關係，也沒有得到它們的授權、贊助或背書。寶可夢相關名稱與圖像的商標與著作權屬於各權利人。」（1.2、1.9）
10. **致謝頁列出並附授權**：PokeAPI（資料 BSD-3-Clause；圖像著作權屬 The Pokémon Company）、@pkmn 與 Pokémon Showdown（MIT）、lucide（ISC）、tabler（MIT）、pokepast.es、Fiske Pokémon 頻道。（1.1、1.4、1.7、1.8）

**D. 圖像與識別**
11. **logo 與文字商標換成自己畫的、不含精靈球造型的圖形。** 在換好之前不對外宣傳。（1.9）
12. **寶可夢圖像三選一，由站主決定**：(a) 維持現狀並接受風險；(b) 改用小像素圖，不存大尺寸官方插畫；(c) 不放圖，用文字加屬性色塊。不論選哪個，都不從官方網站或遊戲畫面擷取圖。（1.2、1.3）
13. **Liquipedia 的兩張圖從部署中移除**，repo 裡也不必留。（1.8）
14. **暫不公開遊戲截圖與影格。** 之後要放時，對照 Pokémon Champions 的影片與靜態圖利用指引，並只放自己或已同意者錄的畫面。（1.3、1.5）

**E. 取得資料的方式**
15. **維持現在的節制**：只讀需要的片段、請求之間留間隔、不公開影格、cookies 不進版控。這不會讓做法符合 YouTube 條款的文字，但降低對平台與創作者的實際影響。是否繼續用會員帳號的 cookies 讀會員影片，等第 1 條有結果再決定。（1.5）
16. **不收錢。** 任何收款或廣告都會讓「目的與性質」這個因素變弱，也離官方指引的非營利前提更遠。細節見 `06-ops-and-funding.md`。（1.2、1.3、1.5）

## 4. 待站主決定或需要請教專業人士的問題

**站主可以自己決定的**
1. 要不要現在就聯絡 Fiske？由誰、用什麼管道、給他看什麼？
2. 在得到回覆前，會員限定內容要不要先從網站與下載檔撤下？（我的建議是先撤。）
3. `intro/*.txt` 與描述欄要不要移出公開 repo？要不要連 git 歷史一起清？或是把 repo 改成私有、只公開建置後的網站？（改私有後 GitHub Pages 是否仍能免費使用，要看帳號方案，我沒有確認。）
4. logo 換不換、何時換？
5. 寶可夢圖像走第 12 條的哪個選項？（等同 line5 的 D4。）
6. 聯絡信箱用哪一個？下架承諾幾天？
7. 聲明頁要不要連條款與隱私頁一起做？目前沒有帳號、沒有分析工具，可以先只做一頁。

**需要請教專業人士的**
1. 把會員限定影片的隊伍配置（不含講解）整理後公開，在台灣著作權法下怎麼評價？配置算不算受保護的表達？
2. 用自己的話改寫創作者的講解重點，到什麼程度仍算「引用」或合理使用，什麼程度算改作？
3. 違反 YouTube 服務條款（自動化存取、下載片段）在台灣會有什麼實際後果？除了帳號被處置之外，有沒有民事責任？
4. 把寶可夢球造型當成網站 logo，在台灣商標法與著作權法下的風險多大？改成「看得出靈感但不相同」的自繪圖形夠不夠？
5. 公開列出國際賽選手的本名與隊伍，個資法第 19 條的哪一款可以作為依據？歐盟選手是否讓我們受 GDPR 約束？
6. 收到創作者、選手或權利人的要求時，我們的下架流程寫成什麼樣子才足夠？
7. 如果站主將來想收捐款，上面各題的答案會怎麼變？

## 沒能確認的事項

- pokemon.com 的 Legal 頁：網頁擷取工具讀得到，但只回傳片段；我另外直接下載時被網站的防護擋下，沒有再試。所以粉絲創作那一段只有片段原文加摘要，沒有完整逐字稿。
- Liquipedia 版權頁：回 403，沒有讀到。表中的說法來自搜尋結果摘要。
- Pokémon Champions 影片指引的繁體中文版：官方站有繁中版首頁，但我沒有找到指引的繁中網址，只核對了日文版。
- 精靈球圖形商標、「I Choose You」商標在台灣或其他地區的註冊狀態：沒有查官方資料庫。
- 官方賽事規則對公開選手姓名與隊伍的條文：沒有找到。
- 台灣是否有法院判決處理過「整理 YouTube 影片內容成資料庫」或「粉絲資料網站使用遊戲圖像」：沒有查。
- `app/` 打包產出是否保留 MIT 授權聲明：沒有檢查。
- victorpoke 的圖片實際來源：沿用 2026-11-10 的觀察，這次沒有重驗。
- 我們自己的數字（284、136、127、34、138、584、64、172）取自 2026-11-13 當天的工作目錄，包含尚未提交的變更。
