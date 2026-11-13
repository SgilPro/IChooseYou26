# 維運與捐款管理線：我們花多少、別人怎麼收錢、我們該不該收

> 調查日期：2026-11-13。
> **這份是事實整理與待確認問題，不是法律或稅務意見。** 我不是律師也不是會計師。稅務與金流的部分只整理官方頁面寫了什麼，實際適用要問國稅局或會計師。
> 姊妹文件：`05-compliance.md`（我們用的資料與素材的條款風險）。本文件第 4、5 節會引用它的編號。

## 方法與限制

- 成本：讀 `research/line5-platform-backend/00-action-plan.md` 的費用表，並重新開官方定價頁核對；用本機指令量了目前網站的體積。
- 別人怎麼收錢：每站只開首頁與聲明頁，看頁面上有沒有捐款連結、廣告、付費方案；另外檢查了先前存下的五個對標站首頁快照裡載入了哪些廣告或捐款程式。沒有登入、沒有點進付款流程。
- 捐款平台：讀官方定價或說明頁。Ko-fi 與 Patreon 的說明中心、PayPal 台灣的費率頁都擋自動存取（回 403），沒有繞過，相關欄位標「未能確認」。
- 「未見」代表這一輪在我開的頁面上沒看到，不等於確定沒有。
- 金額都是當天頁面顯示的值。

## 0. 先講結論

1. **我們現在的現金成本是 0 元，而且短期內看不到必須花錢的理由。** 網站約 60 MB，遠低於 GitHub Pages 的 1 GB 上限。就算照 line5 上 Supabase，免費方案的額度（500 MB 資料庫）對我們估計不到 50 MB 的資料綽綽有餘；要付費的話是每月 25 美元起。
2. **同類站裡，收錢的方式只有三種：自願捐款（Ko-fi、Patreon）、廣告、聯盟行銷連結。沒有看到任何一站把功能鎖在付費牆後面。** 功能最齊的 PokéOmni 完全不收錢也不放廣告。和我們最像的 TrainerOps（條款寫適用台灣法律）用 Ko-fi 收自願捐款，並在條款裡寫明捐款不是購買商品或服務。
3. **收錢會提高被權利人注意的機率，但不收錢也不是護身符。** 寶可夢公司前法務長公開說過，粉絲專案「拿到資金」是他們出手的時間點；另一方面，2024 年被下架的 Relic Castle 自稱非營利、沒有廣告。官方的 Champions 指引把非營利當成前提。
4. **對我們來說，比寶可夢公司更近的風險是創作者。** 我們的內容幾乎全部整理自單一頻道，其中一大部分來自付費會員影片（見 `05-compliance.md` 1.5e）。在沒有取得創作者同意之前收任何錢，等於拿別人的付費內容募款。
5. 建議：維持不收錢（第 0 或第 1 級），並把這件事公開寫出來。等到真的有固定成本、而且法遵線的前置條件完成後，再考慮第 2 級。

## 1. 我們目前的成本結構

### 現況

| 項目 | 現況 | 費用 | 依據 |
|---|---|---|---|
| 網站代管 | GitHub Pages（`sgilpro.github.io/IChooseYou26`） | 0 | GitHub Pages 限制：網站最大 1 GB、每月頻寬 100 GB 軟上限、每小時 10 次建置軟上限（用自訂 Actions 建置不受此限）（摘要）<https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits> |
| 網站體積 | 約 60 MB（官方插畫 45 MB、縮圖 6.2 MB、資料檔約 6.3 MB、道具圖 1.7 MB、頁面 0.5 MB；不含 `app/` 的打包檔） | — | 2026-11-13 本機量測來源資料夾，不是量線上站 |
| 網域 | 沒有自訂網域 | 0 | repo 內沒有 CNAME 檔 |
| 後端、資料庫、登入 | 沒有 | 0 | line5 文件第三節 |
| 流量分析 | 沒有 | 0 | 頁面內沒有分析程式 |
| 資料抽取用的 AI 用量 | 有，但沒有量測 | **未量測** | `tools/yt/README.md` 記載曾「為了省 token」關閉排程 |
| 頻道會員費 | 站主個人的 YouTube 頻道會員 | **未確認金額** | 讀會員影片的前提 |
| 站主的時間 | 最大的實際成本 | — | — |

**GitHub Pages 的使用限制**：官方說明寫 Pages 不可以用來經營線上生意、電商網站，或主要用於促成商業交易、提供商業軟體服務的網站，也不應該處理付款或登入憑證這類敏感交易（摘要，同上網址）。這一頁沒有提到捐款連結或廣告。GitHub 的使用政策另寫（原文）：「We do not generally prohibit use of GitHub for advertising.」但 Pages 等處的內容主要目的不應該是廣告或促銷；並提到使用者可以張貼支持者的名稱或標誌（摘要）。<https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies>

我的解讀：放一個連到外部平台的捐款連結，沒有被這兩份文件明文禁止；在 Pages 上放廣告聯播網，文件沒有明講可不可以，**未確認**。

### 如果照 line5 上後端

line5 的計畫是 Phase 1 維持純靜態，Phase 2 才接 Supabase（登入與線上編輯），進入條件是站主一週內想在網頁改資料超過約 10 次、或需要登入才能看的內容、或資料超過約 5 MB 影響載入。

| 方案 | 月費 | 額度重點 | 來源 |
|---|---|---|---|
| Supabase Free | 0 | 資料庫 500 MB、每月活躍使用者 50,000、檔案儲存 1 GB、流出流量 5 GB；最多 2 個運作中的專案；原文：「Free projects are paused after 1 week of inactivity.」 | <https://supabase.com/pricing>（2026-11-13 核對，與 line5 的記載一致） |
| Supabase Pro | 25 美元起 | 每專案磁碟 8 GB、每月活躍使用者 100,000、流出流量 250 GB；含 10 美元運算額度；預設開啟花費上限。超量單價：磁碟每 GB 0.125 美元、流量每 GB 0.09 美元、活躍使用者每人 0.00325 美元 | 同上 |
| Cloudflare D1 加 Workers | 0；付費版每月最低 5 美元 | 見 line5 費用表 | line5 文件（這次沒有重新核對） |
| Firebase Spark | 0 | 見 line5 費用表 | line5 文件（這次沒有重新核對） |
| PocketBase 自架 | 約 2 到 6 美元 | 需自備主機；line5 自己註明是估計、未逐一比價 | line5 文件 |

**可能的月費區間**
- 維持靜態站：0。
- 上 Supabase 免費方案：0。要處理的是「閒置一週會暫停」，line5 已規劃定時喚醒與每日備份。
- 升級 Supabase Pro：每月 25 美元，一年約 300 美元。line5 估計我們的隊伍資料不到 50 MB，所以除非開放投稿（Phase 3）帶來大量使用者，否則沒有升級的理由。
- 自訂網域：沒有查價格，**未確認**。

**結論**：在 Phase 3 之前，沒有哪一筆固定支出是非付不可的。「為了付帳單而收捐款」這個理由目前不成立。

## 2. 別人怎麼收錢

| 網站 | 捐款 | 廣告 | 付費方案 | 其他 | 看的頁面 |
|---|---|---|---|---|---|
| PokéOmni | 未見 | 沒有。隱私頁原文：「本站沒有廣告、不販售資料、不做跨站行為追蹤。」首頁快照也沒有廣告程式 | 未見 | — | <https://pokeomni.com/>、`/about`、`/terms`、`/privacy` |
| TrainerOps | **Ko-fi**（<https://ko-fi.com/margames>）。我看的三個頁面都有「Buy me a coffee」連結；About 頁有一節「Enjoying TrainerOps?」加「Support on Ko-fi」按鈕 | 未見廣告程式 | 未見 | 條款有「Voluntary donations」一節（見下） | <https://trainerops.app/en/about>、`/acknowledgements`、`/terms` |
| victorpoke | 未見 | **Google AdSense**。隱私頁原文：「本站可能透過 Google AdSense 顯示廣告。」頁面載入了帶發布商編號的 AdSense 程式 | 未見 | — | <https://victorpoke-champions.com/zh-TW/about>、`/credits`、`/terms`、`/privacy` |
| Pikalytics | **Ko-fi**（<https://ko-fi.com/pikalytics>），頁尾「Support Us」 | **有**。首頁快照載入了 NitroPay 與 Google 的廣告程式；頁尾有「Advertise on Pikalytics」聯絡連結 | 首頁未見 | — | <https://www.pikalytics.com/> |
| Serebii | **Patreon**（<https://www.patreon.com/serebiinet>），頁面顯示每月 3 美元起，說明只寫可解鎖專屬貼文 | **有**。隱私頁原文：「All or partial advertising on this Website or App is managed by Playwire LLC.」 | 未見 | — | <https://www.serebii.net/>、<https://www.serebii.net/privacy.shtml> |
| Smogon | 首頁未見 | 首頁未見 | 未見 | — | <https://www.smogon.com/> |
| Pokémon Showdown | 首頁未見 | 首頁未見 | 未見 | 致謝頁在「Sponsor」底下列 Smogon University | <https://pokemonshowdown.com/>、<https://pokemonshowdown.com/credits> |
| Limitless | **Patreon**（<https://www.patreon.com/limitlesstcg>），頁面顯示每月 2 美元起、279 位付費會員、每月 407.1 美元 | 未見（只看了頁面文字，沒有檢查載入的程式） | 未見 | **聯盟行銷連結**。原文：「You can support us by using our Affiliate Link when buying on TCGplayer!」 | <https://play.limitlesstcg.com/> |
| Victory Road | 首頁未見 | 首頁未見（沒有檢查載入的程式） | 未見 | 首頁有自辦賽事的報名宣傳，是否收費頁面沒寫 | <https://victoryroad.pro/> |

**沒能確認的**：兩個 Ko-fi 頁面都擋自動存取（403），所以 TrainerOps 與 Pikalytics 在 Ko-fi 上有沒有開定期會員、建議金額多少，都不知道。Serebii 與 Limitless 的 Patreon 只看到起價，沒看到各級方案的內容。

**觀察**
1. **沒有任何一站把查資料或工具鎖成付費。** 收錢的方式都是「自願」或「廣告」。
2. **新站傾向不放廣告。** 2026 年出現的三個中文站裡，只有 victorpoke 放廣告；PokéOmni 特別把「沒有廣告」寫進隱私頁當成賣點。
3. **老站才有廣告加贊助的組合。** Serebii（1999 年起）與 Pikalytics 兩者都有。
4. **TrainerOps 的條款寫法值得參考**（原文）：「Donations are a voluntary contribution toward running the site, not a purchase of any goods or services, and are generally non-refundable. All payments are handled by that third-party platform; the site neither sees nor stores your payment information.」這段話同時處理了三件事：捐款不是交易、原則上不退款、網站不經手付款資料。

## 3. 捐款平台比較

| 平台 | 平台抽成 | 其他費用 | 怎麼拿到錢 | 台灣個人能不能用 | 要不要公司或統編 | 來源 |
|---|---|---|---|---|---|---|
| Ko-fi | **未能確認**（官方說明頁回 403）。搜尋結果轉述：單次捐款 0%，會員與商店 5%，付費升級後免抽成 | 付款處理商的手續費另計（金額未確認） | 搜尋結果轉述：直接進創作者自己的 PayPal 或 Stripe 帳戶，平台不代管 | Stripe 的支援地區名單裡沒有台灣（<https://stripe.com/global>），所以要走 PayPal。TrainerOps 的條款寫適用台灣法律並使用 Ko-fi，可推測實務上可行，但**沒有從官方頁確認** | 未確認 | <https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee>（403） |
| Buy Me a Coffee | 5%（原文：「we only apply a 5% platform fee per transaction」） | Stripe 處理費 2.9% 加 0.30 美元；提領 0.5%；美國以外的交易加 1%；定期付款加 0.5%（摘要） | 透過 Stripe Express 提領，說明頁寫支援 130 多個國家 | **未確認**。說明頁沒有列出國家名單 | 未確認 | <https://help.buymeacoffee.com/en/articles/8105744>、<https://help.buymeacoffee.com/en/articles/5777478-how-to-set-up-payouts-with-stripe-express> |
| GitHub Sponsors | 個人贊助 0%（原文：「GitHub Sponsors does not charge any fees for sponsorships from personal accounts」）；組織帳號贊助最高 6% | — | 需居住在支援地區 | **不行。** 官方支援地區名單沒有台灣（我下載頁面逐字核對過；名單有日本、香港、新加坡、南韓等） | 不適用 | <https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors> |
| Patreon | 10%（定價頁寫收入的 10%） | 原文：「Plus payment processing, currency conversion, and payout fees, and applicable taxes.」沒有列費率 | 未能確認（說明中心回 403） | **未確認** | 未確認 | <https://www.patreon.com/pricing> |
| 綠界 ECPay | 沒有平台抽成，收的是金流手續費 | 國內信用卡 2.75%，每筆最低 5 元；ATM 虛擬帳號 1%，每筆最低 15 元；超商代碼每筆 31 元；跨行提領每次 15 元；以上未含 5% 營業稅（摘要） | 付款後 10 日內撥款到銀行帳戶 | 可以。費率頁有「個人」會員，30 日收款額度 20 萬元（商務會員 50 萬元） | 費率頁沒有說明。頁面提醒：個人以營利為目的在網路銷售達一定金額，應辦稅籍登記與商業登記（摘要） | <https://www.ecpay.com.tw/Business/payment_fees> |
| PayPal（直接收款） | **未能確認**（台灣費率頁回 403） | 未能確認 | 未能確認 | 未能確認 | 未確認 | <https://www.paypal.com/tw/webapps/mpp/paypal-fees>（403） |

其他台灣金流（藍新、歐付寶、街口、LINE Pay 等）與台灣本地的贊助平台，這一輪沒有查。

**怎麼讀這張表**
- 對台灣個人來說，**GitHub Sponsors 這條路是關著的**，雖然它對開源專案最合理也最便宜。
- Ko-fi 是同類站最常用的（TrainerOps、Pikalytics），但它的錢是經過 PayPal 進來的，而 PayPal 台灣帳戶的費用與提領方式我沒能從官方頁確認。動手前要先用站主自己的 PayPal 帳戶看一次實際條件。
- 綠界的優點是台幣、本地付款方式、費率公開；缺點是它是金流工具不是贊助頁，需要自己建收款頁，而且 GitHub Pages 的說明不建議在 Pages 上處理付款。綠界有沒有現成的「收款連結」或贊助頁產品可以外連，**未確認**。

### 對個人的稅務提醒（只整理查到的官方說法）

- **營業稅的起徵點**：財政部稅務入口網的網路交易問答寫，個人透過網路銷售，每月銷售額未達起徵點可以暫時免辦稅籍登記；起徵點自民國 114 年 1 月 1 日起是銷售貨物每月 10 萬元、銷售勞務每月 5 萬元；超過就要辦稅籍登記並報繳（摘要）。同一頁提到，即使免徵營業稅，所得仍要併入個人綜合所得申報（摘要）。這一頁**沒有談到贊助、打賞或捐款**。<https://www.etax.nat.gov.tw/etwmain/tax-info/network-transaction-taxtation-area/q-and-a>
- **觀眾打賞的所得類別**：依 KPMG 的整理（第二手來源，我沒有讀到財政部的原始函令），財政部在 2025-12-23 以台財稅字第 11404615670 號令訂定「個人於網路發表創作或分享資訊課徵綜合所得稅作業規範」，把平台分潤、觀眾打賞等列為執行業務收入，可核實認列費用或適用 45% 的費用率；輔導期到 2026-06-30，已經結束。<https://kpmg.com/tw/zh/insights/2026/03/kol-comprehensive-income-tax-guidelines.html>
- **未確認的**：一個粉絲資料網站收到的自願捐款，算上面那種「網路發表創作」的收入、算贈與、還是算其他所得，我沒有查到直接對應的官方說明。外幣經 PayPal 進來的款項怎麼認定來源地，也沒有查到。
- 實務上的最低要求：不論金額多小，都留下每一筆收入與對應支出的紀錄。

## 4. 粉絲專案收錢的額外風險

### 官方怎麼說

| 來源 | 內容 | 和收錢的關係 |
|---|---|---|
| 寶可夢公司前法務長 Don McGowan 接受 Aftermath 專訪（2024-03-13，Luke Plunkett 撰）<https://aftermath.site/pokemon-lawyer-cease-desist-fan-project-pikachu-movie> | 原文：「You don't send a takedown right away. You wait to see if they get funded (for a Kickstarter or similar); if they get funded then that's when you engage.」另外提到公司常是從媒體報導得知粉絲專案，以及「No one likes suing fans.」 | 這是前任主管的個人說法，不是公司政策。但它直接把「拿到資金」說成出手的時間點 |
| Pokémon Champions 影片與靜態圖利用指引（2026-04-08 生效）<https://www.pokemonchampions.jp/ja/streaming_guideline/> | 日文原文：「非営利目的に限り」可以把遊戲影片與靜態圖貼到網站與社群平台；只有使用分享平台正式提供的功能時可以營利（後半為摘要） | 官方對 Champions 內容的預設是非營利。自己架站收捐款或放廣告，不在它允許的營利方式裡。注意：這份指引管的是遊戲截圖與影片，我們目前沒有公開截圖 |
| Pokémon Champions 活動舉辦指引（2026-04-08，04-17 追加）<https://www.pokemonchampions.jp/ja/event_guideline/> | 摘要：限非營利活動；不得從贊助商等第三方收取物品、服務或金錢；但為了補貼場地等營運費用而收報名費不在禁止之列 | 這是辦比賽的規定，不是辦網站的。但可以看出官方畫的線：補貼成本可以，營利與拿贊助不行 |
| 任天堂的網路服務著作物利用指引（2024-09-02 更新）<https://www.nintendo.co.jp/networkservice_guideline/en/index.html> | 原文：「Other forms of monetization of our intellectual property for commercial purposes are not permitted.」 | 只談影片與圖片分享平台，沒有提到寶可夢是否適用 |
| pokemon.com 使用條款（2023-06-15）<https://www.pokemon.com/us/legal/terms-of-use> | 禁止事項包括（原文片段）：「placing advertising, sponsorships, or promotions on or within the Service or content」 | 管的是官方網站的內容，我們沒有從那裡取資料 |

**沒有找到的**：寶可夢公司或任天堂針對「粉絲資料網站可不可以收捐款或放廣告」的直接聲明。**未找到。**

### 已知案例

| 年份 | 事件 | 和錢有關嗎 | 來源 |
|---|---|---|---|
| 2015 | 寶可夢公司控告西雅圖一場非官方寶可夢派對的主辦人。海報用了皮卡丘等圖像，門票每張 2 美元。主辦人說事前沒有收到任何警告信；他提供的和解提案文件要求支付約 5,400 美元的律師費與訴訟費 | 有收門票，金額很小 | Game Informer，2015-10-05 <https://www.gameinformer.com/b/news/archive/2015/10/05/the-pokemon-company-sued-a-party-planner-for-infringement-but-not-all-is-as-it-seems.aspx> |
| 2020 至 2021 | 任天堂要求 Game Jolt 下架 379 款粉絲遊戲 | 維基百科條目說任天堂的理由提到遊戲頁面有廣告收入。我想讀原始報導（Nintendo Life）但被擋，**未能核對** | <https://en.wikipedia.org/wiki/Nintendo_and_fan_games> |
| 2024 | 粉絲遊戲論壇 Relic Castle 收到寶可夢公司的下架通知後關站。站方聲明原文：「Relic Castle has always been a non-profit, ad-free, tight-knit community」 | **沒有收錢、沒有廣告，仍然被下架** | Gfinity，2024-03-22 <https://www.gfinityesports.com/article/relic-castle-pokemon-fan-game-forum-killed-by-dmca-takedown> |

這三個案例都不是資料查詢網站。**針對粉絲資料網站因為收捐款或放廣告而被追究的公開案例：未找到。**

### 另一面的觀察

Serebii（廣告加 Patreon）、Pikalytics（廣告加 Ko-fi）、victorpoke（AdSense）、TrainerOps（Ko-fi）目前都在運作。這說明收錢不會自動招來處置，但不能反推「所以沒事」：我們看不到有沒有站私下收過通知，而且這些站的內容來源和我們不同。

### 我們自己多出來的三個風險

1. **創作者。** 我們的內容幾乎全部整理自 Fiske 的頻道，其中 284 支隊伍標為會員限定（`05-compliance.md` 1.5e）。頻道會員是創作者的收入來源。在他不知情的情況下，我們一邊免費公開他的付費內容、一邊收捐款，是最容易引發爭議的組合，也最難辯解。
2. **合理使用的第一個因素。** 台灣著作權法第 65 條第 2 項第 1 款看的是「利用之目的及性質，包括係為商業目的或非營利教育目的」（原文）。現在我們可以說是非營利的學習用途；開始收錢後，這句話就要打折。
3. **取得資料的方式。** 我們用自動化工具讀 YouTube，和它的服務條款文字不合（`05-compliance.md` 1.5）。不收錢時這是個人研究性質的灰色地帶；收錢後性質會不同。

## 5. 建議選項（由不收錢到收錢）

| 級別 | 做法 | 前置條件 | 工作量 | 風險 |
|---|---|---|---|---|
| **第 0 級** 不收錢 | 維持現況，並在聲明頁寫一句「本站不收捐款、沒有廣告」 | 無 | 幾乎為零（聲明頁本來就要做） | 最低。成本由站主自付，目前現金支出是 0 |
| **第 1 級** 不收錢，把支持導出去 | 在第 0 級之上：(a) 每個隊伍頁放「想支持請訂閱或加入原頻道會員」的連結；(b) 接受非金錢的幫忙，例如回報錯誤、校對資料、GitHub 上的修改建議 | 聯絡信箱或回報管道 | 小。加連結與一段說明，半天以內 | 低。這一級會改善我們和創作者的關係，而且強化「把人導回原影片」的定位 |
| **第 2 級** 自願單次捐款，只補貼成本 | 放一個外部平台的捐款連結（TrainerOps 的做法）。公開列出每月成本與收到的金額，超過成本就關閉或暫停 | 全部都要先完成：(1) 取得 Fiske 的同意，或已把來自他付費內容的部分撤下；(2) logo 已換、聲明頁與下架管道已上線；(3) 真的有固定支出，例如升級到每月 25 美元的方案；(4) 條款加入捐款條文；(5) 用站主自己的帳戶確認平台與 PayPal 的實際費用與提領方式；(6) 問過國稅局或會計師這筆錢怎麼報 | 設定約一天；之後每月記帳與公布，持續性的小工作 | 中。被權利人注意的機率上升；合理使用的非營利論點變弱；多了記帳與報稅義務。金額大概很小（參考：Limitless 這種規模的站，Patreon 頁面顯示每月約 407 美元） |
| **第 3 級** 定期贊助、廣告或付費功能 | Patreon 或 Ko-fi 會員、廣告聯播網、把部分功能設成付費 | 第 2 級的全部，再加上：(1) 搬離 GitHub Pages 或確認它允許；(2) 隱私政策與 cookie 告知（廣告會追蹤使用者）；(3) 付費回饋只能是我們自己做的東西，不能是整理自他人影片的內容；(4) 可能需要稅籍登記 | 大。換代管、寫政策、接金流或廣告、持續經營贊助者 | 高。直接離開官方指引的非營利前提；最接近前法務長說的出手時間點；若把他人內容放在付費牆後，創作者風險最大。**不建議** |

**我的建議**：現在選第 1 級。理由有三個：沒有需要補貼的帳單；法遵線的前置條件一項都還沒完成；第 1 級的成本很低，卻能把最大的風險來源（創作者不知情）變成助力。第 2 級可以留作日後的選項，條件是「有帳單、有同意、有聲明頁」三者齊備。

## 6. 待站主決定的問題

1. 要不要公開寫明「本站不收捐款、沒有廣告」？（PokéOmni 這樣做。寫了以後要改口會比較尷尬，但對信任有幫助。）
2. 第 1 級的「支持原頻道」連結要不要做？放在隊伍頁還是全站頁尾？
3. 如果將來走第 2 級，你能接受的上限是「只補貼成本」還是可以有結餘？結餘怎麼處理？
4. 你有沒有 PayPal 帳戶？願不願意用個人名義收款？（這會讓你的姓名出現在付款紀錄上。）
5. AI 用量與頻道會員費要不要開始記錄？不記就無法回答「這個站每月實際花多少」。
6. line5 的 Phase 2 何時啟動？如果一年內不會，後端費用可以從討論中移除。
7. 廣告是不是直接排除？（我的建議是排除。）
8. 要不要先用一封訊息問 Fiske 對「整理他的隊伍」和「將來若收捐款」的看法？他的回答會同時決定法遵線與本線的走向。

## 沒能確認的事項

- Ko-fi 的官方費率與提領方式（說明中心回 403）；表中數字來自搜尋結果的轉述。
- TrainerOps 與 Pikalytics 的 Ko-fi 頁面內容（回 403）。
- Patreon 的處理費、提領方式、是否支援台灣（說明中心回 403）。
- Buy Me a Coffee 是否支援台灣提領（說明頁沒有列國家）。
- PayPal 台灣帳戶的收款費率、提領方式與限制（官方費率頁回 403）。
- 綠界個人會員是否需要統編、有沒有現成的贊助或收款連結產品。
- 其他台灣金流與本地贊助平台：沒有查。
- 自願捐款在台灣的所得類別與申報方式：沒有查到直接對應的官方說明；財政部的原始函令我沒有讀到，只讀到 KPMG 的整理。
- GitHub Pages 上能不能放廣告聯播網：官方文件沒有明講。
- 2021 年 Game Jolt 下架通知是否提到廣告收入：原始報導被擋，只有維基百科的說法。
- Smogon、Showdown、Victory Road 的實際經費來源：只看了首頁，未見不等於沒有。
- 自訂網域的價格、我們的 AI 用量費用、頻道會員費：沒有查或沒有量測。
- Cloudflare、Firebase、PocketBase 的價格：沿用 line5 文件（2026-11-08）的記載，這次沒有重新核對。
