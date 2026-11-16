# 創作者授權策略：要什麼、怎麼談、YouTube 條款怎麼處理

> **完整版見 `09-licensing-strategy-memo.md`（2026-11-16）**：含組織定位、法源、跨國案例、提案技巧與執行計畫。這份是較早寫的簡短操作版；兩份有出入時以 `09` 為準。已知出入：(1) 違反 YouTube 條款的後果，`09` 第 5.3 節依台灣 Lawsnote 案重新評估，會員帳號自動下載的風險比這裡寫的重；(2) Wolfey 的聯絡信箱以 `09` 第 6.2 節為準；(3) 賽事隊伍的來源，`09` 確認 Limitless 可用、RK9 禁止自動擷取。
>
> 調查日期：2026-11-15。接續 `05-compliance.md`（那份盤點「我們用了什麼、條款怎麼寫」；這份回答「接下來怎麼做」）。
> **這份不是法律意見。** 我不是律師。判例與條款的解讀是用來排優先順序的，對外公開或收錢之前，`05-compliance.md` 第 4 節的問題仍應請教專業人士。
> 引用標示：「原文」是我讀到的頁面字句；「摘要」是轉述；「未核對」是只從二手來源或工具摘要得知。

## 0. 結論

1. **創作者的同意解決不了 YouTube 條款。** 這是兩件事：創作者能授權的是他自己的講解與剪輯；「用自動化工具存取、下載」是我們和 YouTube 之間的約定，條款寫的例外是「YouTube 和相關著作權人的事先書面許可」，兩者都要。所以 ToS 的解法不是「拿到授權後繼續用 yt-dlp」，而是**換一條不經過自動抓取的取得路線**（第 2 節）。
2. **最乾淨的路線是請創作者直接把資料給我們**（pokepaste 連結、隊伍表、字幕檔）。資料是創作者自己的，從他手上拿，完全不經過 YouTube 的服務，條款就不適用。這同時也是最好談的請求：他只要貼連結。
3. **要授權時分層要**（第 3 節）。索引與連結不必等同意；隊伍配置採「告知＋隨時可撤」；講解的改寫摘要要明確同意；截圖、字幕原文、會員內容要書面授權，預設不做。一開始只要最小的那一層。
4. **順序：先整理自己，再談 Fiske，再談中型創作者，最後才是 Wolfey 與 Cybertron**（第 5 節）。大創作者有經紀窗口，會先看網站再決定要不要回信；沒有聲明頁、聯絡方式、下架流程，或 logo 還是大師球的時候去談，成功率低而且只有一次機會。
5. **會員影片的自動下載我建議停在現在這裡。** 佇列目前因為有兩支已下載未處理而自然停住（沒有在下載）。就算 Fiske 同意我們整理會員內容，用會員帳號的 cookies 自動下載仍然違反條款文字，被處置的是站主的 Google 帳號。會員內容若要做，請 Fiske 直接提供，或由人看影片手動登記。這一點要站主決定（第 8 節）。

## 1. 先把三層權利分開

一支寶可夢對戰影片上疊著三層權利，每一層的「誰能說可以」不一樣。談授權之前要先知道對方能給什麼、不能給什麼。

| 層 | 權利人 | 內容 | 創作者能授權嗎 |
|---|---|---|---|
| 遊戲本身 | Nintendo／Creatures／GAME FREAK／The Pokémon Company | 遊戲畫面、寶可夢圖像、音樂、名稱 | 不能。創作者自己也是依官方指引被容許使用 |
| 影片 | 創作者 | 口述講解、字幕、剪輯、縮圖、投影片 | 能 |
| 平台 | YouTube | 存取方式（播放、嵌入、API） | 不能。這是每個使用者各自和 YouTube 的約定 |

幾個直接的推論：

- **遊戲畫面截圖，創作者同意也不夠。** Nintendo 的指引只涵蓋「在影片與圖片分享平台上分享」，並寫明其他用途依各地法律（摘要；原文片段：「The Guidelines only cover the sharing of Nintendo Game Content on appropriate video and image sharing sites.」）<https://www.nintendo.co.jp/networkservice_guideline/en/index.html>。該指引只適用個人、不適用法人，營利方式限於平台提供的功能（摘要）。Pokémon Champions 另有自己的影片指引，見 `05-compliance.md` 1.3。所以我們網站上放影格這件事，不在任何一份指引的容許範圍內，跟創作者要不要緊無關。
- **隊伍配置比較接近事實。** 台灣著作權法第 10 條之 1（原文）：「依本法取得之著作權，其保護僅及於該著作之表達，而不及於其所表達之思想、程序、製程、系統、操作方法、概念、原理、發現。」哪六隻、帶什麼招式，屬於這一類的可能性高；「為什麼這樣配」的講解是表達。這是我的判讀，沒有找到台灣的判決或智慧財產局函釋直接處理對戰隊伍。
- **不受著作權保護不等於可以不問。** 創作者圈靠的是關係。一位創作者公開說「這個站沒問過我」，比一封律師函的殺傷力大，而且會讓後面每一位都拒絕。
- **會員內容是另一回事。** 就算配置是事實，它正是會員付費換到的東西；公開它直接取代付費福利（合理使用第四因素），也違反 YouTube 付費服務條款（見 `05-compliance.md` 1.5）。

## 2. YouTube 條款怎麼處理

### 條款實際寫了什麼

YouTube 服務條款（生效日 2022-01-05；台灣版原文見 `05-compliance.md` 1.5，以下為英文對照版的原文片段）<https://www.youtube.com/t/terms>：

- 不得「access, reproduce, download, distribute … or otherwise use any part of the Service or any Content except: (a) as expressly authorized by the Service; or (b) with prior written permission from YouTube and, if applicable, the respective rights holders」。
- 不得「access the Service using any automated means (such as robots, botnets or scrapers) except (a) in the case of public search engines, in accordance with YouTube's robots.txt file; or (b) with YouTube's prior written permission」。
- 創作者給其他使用者的授權只限於透過服務本身的功能使用，並寫明「this license does not grant any rights or permissions for a user to make use of your Content independent of the Service」。
- 明文允許的：個人非商業觀看，以及「show YouTube videos through the embeddable YouTube player」。
- 不得在「主要由 YouTube 內容構成」的頁面上賣廣告（摘要）。

也就是說，條款允許的只有三種：人看、嵌入播放器、官方 API。

### 違反的實際後果

- **最直接的是帳號與連線。** YouTube 可以停用帳號、封鎖 IP。用會員帳號的 cookies 自動下載時，處置對象是站主的 Google 帳號（連同 Gmail、雲端硬碟）。
- **契約責任，美國的參考案例**（二手來源：律師事務所與法律部落格的整理，未讀判決原文；美國法，不是台灣法）：
  - hiQ v. LinkedIn：發回後法院就違約部分判 LinkedIn 勝（部分即決判決），hiQ 建立假帳號是不利因素。<https://blog.ericgoldman.org/?p=26009>
  - Meta v. Bright Data（N.D. Cal.，2024-01-23）：法院認為 Meta 的條款規範的是「使用」服務，**登出狀態**抓公開資料不算，判 Bright Data 勝。評論者強調這是針對 Meta 條款文字的判斷，不代表登出抓取一律沒事。<https://www.fbm.com/data-analytics/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/>、<https://techcrunch.com/2024/01/24/court-rules-in-favor-of-a-web-scraper-bright-data-which-meta-had-used-and-then-sued>
  - 對我們的意義：未登入讀公開影片資料是灰色地帶；**登入後（會員 cookies）抓取是條款約束最明確的情況**，也是那兩個案子裡對抓取方最不利的事實。
- **台灣**：違反網站條款的民事責任，我沒有查到判決，仍列在 `05-compliance.md` 第 4 節待請教。
- YouTube 影片被大量抓去訓練 AI 的訴訟正在進行（例如創作者告 Nvidia，尚無判決，二手來源）<https://law360.com/articles/2445840>。創作者與平台現在對「抓影片」特別敏感，這是談授權時要預期的氣氛。

### 可行的取得路線

| 路線 | 做法 | 合不合條款 | 拿得到什麼 | 代價 |
|---|---|---|---|---|
| **A. 創作者直接提供** | 創作者給 pokepaste 連結、隊伍表、從 YouTube Studio 匯出的字幕檔，或填我們的表單 | 不經過 YouTube，條款不適用 | 隊伍全部欄位、作者本人確認過的資料 | 要先談成；創作者要花一點時間 |
| **B. 人看影片、手動登記** | 站主或志工用一般方式看影片，把看到的事實打進表單；網站用嵌入播放器 | 觀看與嵌入是條款明文允許的。條款的「個人、非商業」限定語仍在，嚴格說不是完全乾淨，但這是所有資料站與維基的做法 | 影片裡看得到的事實 | 慢；一支對戰影片的隊伍約 5–10 分鐘 |
| **C. 官方 Data API** | 用 API 金鑰讀頻道影片清單、標題、日期、縮圖網址 | 合，但要守開發者政策 | 只有影片資料；章節、字幕拿不到（字幕下載要影片擁有者授權） | 見下方條件 |
| **D. 用其他公開來源取代影片** | 賽事隊伍改從 Limitless、官方公開隊伍表取得，播報影片只當「相關影片」連結 | 與 YouTube 無關 | 賽事隊伍（官方賽事的公開隊伍表通常含性格以外的欄位；Limitless 實際涵蓋哪些賽事與欄位，我還沒有逐場核對） | 要寫匯入程式；Limitless 條款沒寫再利用規定，照同類站標明來源 |
| E. YouTube 書面許可 | 向 YouTube 申請 | 合 | — | 對個人專案不實際；我沒有找到給非學術小型專案的申請管道 |
| （現況）yt-dlp 讀公開影片 | 自動讀清單、資料、字幕、短片段 | 不合條款文字 | 全部 | 帳號以外的風險低，但無法對創作者或平台說「我們是合規的」 |
| （現況）會員 cookies 下載 | 登入狀態自動下載整支會員影片 | 不合，且是最明確的一種 | 會員影片畫面 | 站主帳號風險；創作者關係風險 |

路線 C 要守的開發者政策 <https://developers.google.com/youtube/terms/developer-policies>：

- 已讀到原文的：網站要有連到 YouTube 服務條款的連結；要有明顯可見的隱私權政策並連到 Google 隱私權政策；不得無限期保存使用者資料（「Don't store user data indefinitely」）。
- **未核對原文**（擷取工具只讀到頁面前四成，後段是工具摘要；`05-compliance.md` 另外核對過其中兩句）：API 資料最多存 30 天，之後要刪除或重新抓取；不得下載、快取影音內容；不得 scrape；顯示 YouTube 內容時要標明來源是 YouTube；不得用 API 資料產生衍生指標；跨頻道彙整資料有限制（看起來針對的是頻道分析數據）。
- 實務上：每 30 天內用排程重抓一次影片資料即可滿足保存規定；我們的隊伍資料不是 API 資料，不受「衍生指標」那條約束，但這一句的適用範圍要在真的申請金鑰前讀完整原文確認。

### 建議

1. **新增資料**一律走 A、B、C、D。新創作者的頻道不再用 yt-dlp 開場。
2. **賽事隊伍優先走 D。** 這次從播報影片抽了約 80 支影片的賽事隊伍，如果 Limitless 有這些賽事的隊伍表，就可以用它重建並順便核對（`_HANDOFF.md` 待核對清單裡被字幕擋住的招式、低信心的太晶屬性都屬於這類）。涵蓋率要先抽幾場賽事確認，我還沒做。
3. **已經用 yt-dlp 取得的 Fiske 資料**：原始檔（字幕、影格、影片）不公開、用完即刪，這已經在做。已抽出的事實欄位留著，但在每筆資料的來源欄標清楚取得方式，之後有創作者提供或官方來源時覆蓋。
4. **會員 cookies 管線停用**，等第 8 節的決定。
5. **網站播放一律用嵌入播放器**，不自己存或轉檔任何影片片段。嵌入的觀看會算在創作者頻道上，這也是談授權時的賣點。

## 3. 授權階梯：一次只要一層

| 層 | 內容 | 需要什麼 | 形式 |
|---|---|---|---|
| T0 索引 | 標題、日期、連結、嵌入播放器 | 不需同意；仍建議告知 | — |
| T1 隊伍事實 | 六隻、招式、道具、特性、性格、努力值、租借碼（公開影片或創作者自己貼的 paste） | 告知＋隨時可撤（對方不回覆時維持，但一說不要就撤）；大創作者改成先問再上 | 一封信或一則訊息 |
| T2 講解導讀 | 用我們的話改寫的重點、連到影片時間點、中文翻譯導讀 | 明確同意 | 對方回覆「可以」的訊息即可，存證 |
| T3 原樣素材 | 縮圖、字幕原文、逐字稿、投影片畫面 | 書面授權。遊戲畫面另受第 1 節第一層限制 | 一頁授權信 |
| T4 會員內容 | 會員影片的任何內容 | 逐項書面同意；預設不做 | 一頁授權信，寫明範圍 |
| T5 營利 | 在含對方內容的頁面上放廣告、收費功能 | 合約與分潤 | 正式合約；目前不適用（我們不收錢） |

同類站的做法落在 T1：TrainerOps 寫的是逐隊人工審核、連回原文、權利屬原作者、作者可要求移除（原文見 `05-compliance.md` 第 2 節）。我們的差異化在 T2（講解導讀與分析），所以 T2 的同意值得認真去要。

## 4. 我們能給創作者什麼

談授權其實是談交換。目前拿得出來的：

- **導流**：每支隊伍都連回影片的時間點，播放用嵌入播放器（觀看數算創作者的）。隊伍頁是長期有人搜尋的入口，影片發布幾個月後仍會帶來觀看。
- **繁體中文讀者**：對英語創作者，這是他們自己觸及不到的觀眾；我們做的是中文導讀，不是搬運。對 Fiske，這是他的觀眾本來就想要的「隊伍總表」。
- **更正權與預覽**：創作者可以在上線前看自己的頁面，可以隨時要求改或撤。
- **明確的不做清單**：不放逐字稿、不放會員內容、不拿內容訓練模型、不賣資料、不放廣告、不暗示對方替我們背書。
- **成效回報**：每季告訴對方我們導了多少點擊過去。**目前做不到**，網站沒有任何流量統計；要承諾這一項，得先加一個不追蹤個人的計數。

目前拿不出來的：錢。非營利狀態下不要主動談分潤；對方問起就照實說不收錢、所以沒有可分的收入，並承諾日後若有收入會先回來談。

## 5. 順序與談法

### 第 0 步：先整理自己（對方會先看網站）

`05-compliance.md` 第 3 節已列出，和談授權直接相關的是：聲明頁（非官方聲明、資料來源、下架流程）、公開聯絡信箱、logo 換掉大師球、會員內容已下架（已完成）、git 歷史裡的字幕與描述全文（未處理）。另外準備一頁**創作者專頁的樣本**，讓對方一眼看到自己的內容會長什麼樣。

### 第 1 步：Fiske

- 他是唯一一位我們已經用了大量內容的創作者，所以這不是「請求授權」，是**坦白現況並請他決定**：我們做了什麼、怎麼取得的（含用會員帳號看會員影片）、目前公開到哪裡、會員內容已經撤下。
- 請他決定三件事：公開影片的隊伍與導讀（T1、T2）可不可以；會員影片要完全不列、只列標題，還是他願意開放某些；他願不願意之後直接給 paste。
- 管道：站主是他的頻道會員，用會員社群貼文留言、Discord（若有）或頻道頁的商務信箱。由站主本人出面，不要用專案帳號。
- 他同意的話，問能不能在聲明頁寫「經 Fiske Pokémon 同意整理」。這一句是後面每一封信的背書。
- 他拒絕的話，照他的範圍撤，並把這個結果當成後續策略的依據（代表 T2 這個差異化要靠自己的內容，不是靠整理別人的）。

### 第 2 步：兩三位中型創作者

選有固定貼 pokepaste 習慣的頻道（T1 資料可以完全不經 YouTube 取得）。目的是累積「幾位創作者已同意」與導流數字。`README.md` 的 1c 創作者名單還沒做，這一步之前要先做。

### 第 3 步：Wolfey、Cybertron

**聯絡管道**（寄之前到本人的 X 與 YouTube 頻道簡介再確認一次）：

- Wolfey（Wolfe Glick）：YouTube 頻道簡介目前（2026-11-16 讀取）寫的商務信箱是 `partnerships@wolfeyvgc.com`。他 2025 年 7 月在 X 上公告過另一個信箱 <https://x.com/WolfeyGlick/status/1940504018876600420>，以頻道簡介目前顯示的為準。第三方名錄列的經紀人姓名我沒有採用，無法查證。
- Cybertron（Aaron Zheng）：YouTube 簡介的商務信箱要登入才看得到；他的 Linktree（linktr.ee/CybertronVGC）有 Email 圖示。

**和談 Fiske 的差別**：

- 信會先到經紀或助理手上。他們篩的是「這是不是商務合作、有沒有風險」。非營利小站的信很容易被略過，所以信要短、請求要小、回一個字就能成立。
- 他們在意的事：品牌被誰拿去用、和贊助商有沒有衝突、內容有沒有被拿去訓練 AI、會不會被誤會是官方合作。信裡直接把不做清單寫出來。
- **先問再上。** 對 Fiske 是事後補告知；對這兩位，在得到回覆前只做 T0（標題、連結、嵌入），連隊伍都先不上。不要先抓完整個頻道再去問。
- 第一次只要 T1，而且優先用他們自己公開的 paste 或公開的賽事隊伍表。T2（中文導讀）等關係建立後再提，這時可以拿 Fiske 與中型創作者的頁面和導流數字當例子。
- 附一頁用他們**一支**公開影片做的樣本（未公開的預覽連結），不要附整個頻道。
- 沒回覆不等於同意。兩週後追一次，之後維持 T0。也可以走社群路線：請認識他們的選手或主播引介，比冷信有效。

**不要做的事**：用對方的臉、頻道 logo、縮圖當我們的宣傳素材；寫「與 Wolfey 合作」之類的字眼（除非對方同意這個說法）；在非營利狀態下開價；同時寄給很多創作者同一封罐頭信。

## 6. 同意要留紀錄，並接到資料管線

口頭說好不夠，日後換人維護或對方換經紀就說不清。建議：

- 每個頻道一個 `data/channels/<handle>/permission.json`（公開）：`status`（`none`／`notified`／`consented`／`declined`）、`tier`（T0–T4）、`granted_on`、`channel`（信件、X 私訊…）、`conditions`、`contact_for_takedown`。對話截圖與原信放 `private/`。
- 發布檢查（`tools/yt/check-public.mjs`）加一條：公開資料的層級不得高於該頻道 `permission.json` 允許的層級。這和現在擋會員內容的機制是同一個做法。
- 聲明頁列出「已同意的創作者」與日期；沒有同意紀錄的頻道只顯示 T0。

## 7. 範本

### 給 Fiske（中文，站主本人發）

> Fiske 你好，我是頻道會員 ○○。我做了一個非營利的雙打隊伍整理網站（連結），想先跟你坦白並請你決定幾件事。
>
> 我做了什麼：把你頻道對戰影片裡的隊伍（六隻、招式、道具等）整理成可搜尋的表，每一筆都連回你的影片；另外用自己的話寫了簡短的導讀。資料是用工具讀影片資料與字幕取得的。會員影片的部分我原本也整理了，後來覺得不妥，已經全部從網站撤下，現在只剩標題與連結。
>
> 想請你決定：
> 1. 公開影片的隊伍表與導讀，可以保留嗎？
> 2. 會員影片：完全不列、只列標題與連結，或是你願意開放的範圍？
> 3. 之後如果方便，隊伍的 pokepaste 連結能不能放在影片說明裡，我就直接用你給的資料。
>
> 網站不放廣告、不收費、不放逐字稿與影片畫面。任何一筆你想改或想撤，跟我說一聲我三天內處理。如果你希望整個撤掉，我也會照做。
>
> 這是你頻道的頁面樣本：（連結）

### 給 Wolfey／Cybertron 的窗口（英文）

> Subject: Permission request – linking your public VGC teams on a non-commercial Traditional Chinese fan site
>
> Hi — I run IChooseYou (link), a free, non-commercial, fan-made VGC doubles team index for Traditional Chinese-speaking players. It is not affiliated with Nintendo or The Pokémon Company.
>
> **The ask:** may we list teams from your public videos (species, moves, items — taken from the pastes you publish), each credited to you and linked to the video with an embedded YouTube player?
>
> **What we don't do:** no transcripts, no screenshots or thumbnails, no members-only content, no ads, no paid features, no AI training, no claim of endorsement.
>
> **Your control:** preview before anything goes live (sample page for one of your videos: link), corrections or removal within 3 days on request, at any time.
>
> Right now we only show titles and links for your channel and will keep it that way unless you say yes. A one-line reply is enough. Happy to answer any questions.

### 一頁授權信的條款（T2 以上才需要）

- 授權範圍：列出層級與內容種類；非專屬、免權利金、可隨時撤回。
- 我們的義務：署名與連結的方式；不修改原意；不轉授權；不用於訓練模型；不營利（若日後營利，另議）。
- 撤回：對方通知後幾天內下架；已散出的下載檔怎麼處理。
- 不包含：遊戲畫面與寶可夢圖像（非創作者所能授權）、會員內容（除非另列）。
- 不構成背書；雙方不得宣稱合作關係，除非另外同意用語。

## 8. 待站主決定

1. **會員影片佇列要不要繼續。** 現況：`KVDHWjf-bNk`（世界賽 2025 二）、`1eZnYO-4uQ0`（EUIC 2025 二）已下載在本機未處理，佇列因此停住；後面還有 8 支沒下載。選項：(a) 到此為止，兩支已下載的處理完存 `private/` 或直接刪；(b) 照原計畫趁 cookies 有效跑完，結果只放 `private/`。我的建議是 (a)：這些是官方賽事，隊伍可以走路線 D 從公開來源取得，不需要為它們承擔帳號風險。
2. 聯絡 Fiske 的時間、管道、由誰發（建議聲明頁與 logo 處理完就發，不要等其他事）。
3. 新創作者是否一律不用 yt-dlp（路線 A–D）。這會讓擴充變慢，但之後對任何人都說得清楚。
4. 要不要加不追蹤個人的點擊計數，好讓「導流回報」成為可兌現的承諾。
5. `permission.json` 與發布檢查要不要現在就做。

## 沒能確認的事項

- YouTube API 開發者政策的後段（保存期限、下載、彙整、衍生資料各條）只有工具摘要，沒有讀到原文。
- pokemon.com 的 Terms of Use 與 Play! Pokémon 規則頁被網站防護擋下，沒有讀到；官方對粉絲資料站有沒有明文政策仍不清楚。
- 有沒有創作者公開反對或同意過「整理影片隊伍的資料站」的先例：搜尋沒有找到相關報導。
- VGCPastes 之類社群彙整專案的收錄與署名規則：沒有查到。
- Cybertron 的商務信箱：沒有取得。Wolfey 的兩個信箱哪個現行：以他 X 上的公告為準，但寄之前要再確認。
- hiQ 與 Bright Data 兩案只讀了二手整理；台灣法下違反網站條款的責任沒有查到判決。
- 台灣智慧財產局對「遊戲對戰隊伍是否為著作」「遊戲實況的著作權歸屬」有沒有函釋：搜尋沒有找到。

## 來源

- YouTube 服務條款 <https://www.youtube.com/t/terms>；開發者政策 <https://developers.google.com/youtube/terms/developer-policies>
- Nintendo Game Content Guidelines <https://www.nintendo.co.jp/networkservice_guideline/en/index.html>；pokemon.com Legal <https://www.pokemon.com/us/legal/>
- Meta v. Bright Data 整理：<https://www.fbm.com/data-analytics/publications/major-decision-affects-law-of-scraping-and-online-data-collection-meta-platforms-v-bright-data/>、<https://techcrunch.com/2024/01/24/court-rules-in-favor-of-a-web-scraper-bright-data-which-meta-had-used-and-then-sued>、<https://blog.ericgoldman.org/?p=26009>
- Nvidia 訴訟報導 <https://law360.com/articles/2445840>
- 資料探勘與合理使用的評論 <https://www.reedsmith.com/en/perspectives/ai-in-entertainment-and-media/2024/02/challenges-of-data-licensing-in-the-us-what-is-fair-use>
- 著作權法第 10 條之 1、第 65 條的說明 <https://www.legis-pedia.com/dictionary/3153>、<https://www.legis-pedia.com/dictionary/2699>
- Limitless 開發者文件 <https://docs.limitlesstcg.com/developer>
- Wolfey 的商務信箱公告 <https://x.com/WolfeyGlick/status/1940504018876600420>；Cybertron <https://x.com/CybertronVGC>
