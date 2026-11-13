# 國外其他競品與「資訊網站能提供什麼內容」

> 調查日期：2026-11-13。
> 接續 `00-framework.md`（已看過 PokéOmni、TrainerOps、victorpoke、Pikalytics、Serebii 五站）與 `research/line3-competitor-tools/01-tool-teardowns.md`（2026-06 拆過的 12 個工具）。這份文件只補那兩份**沒看過**的英文、日文網站，再把所有站實際提供的「內容類型」整理成一張清單。

## 0. 方法與限制（先讀）

**怎麼查的**
- 先用網路搜尋找候選站，再一站一站開頁讀。每站只開首頁加一到三個子頁，沒有大量抓取，沒有登入任何網站。
- 頁面是 JavaScript 產生、一般抓取讀不到字的（Smogon 圖鑑、Reportworm、LabMaus、ポケノート、pkmn.help、Marriland），改用一般瀏覽器開頁讀畫面文字。
- 網站回應 403（擋自動存取）的，**沒有再想辦法繞過**，直接記為「擋自動存取，未能確認」。

**限制**
- 只看未登入狀態下頁面上寫的字。**沒有實際操作任何工具，也沒有驗證任何計算或資料的正確性**。
- 矩陣裡的 ● △ ○ ？ 是依導覽列與頁面文字判斷，和 `00-framework.md` 同一套標準。「○ 未見」代表這一輪沒看到，不等於確定沒有。
- 部分頁面是由讀頁工具摘要後回給我，不是我逐字讀原始碼。引號內的英文、日文是摘要中引用的原文；數字是 2026-11-13 當天頁面顯示的值。
- 「是否支援 Champions」的判斷依據寫在每站底下。只在搜尋結果看到、沒有親自開頁的，一律標「未確認」。
- 有幾個頁面的清單當下沒載入（MunchStats 的隊伍與 replay 清單、Reportworm Standings、LabMaus 賽事清單），只看得到篩選條件與說明文字，看不到內容。

**結果一句話**：親自開頁確認存在的新站共 **24 個**，其中 **21 個**明確支援 Pokémon Champions、2 個部分支援、1 個不支援；另有 13 個候選項目沒能確認、已停止運作或沒有 Champions 內容（見第 3 節）。

---

## 1. A 部分：國外其他競品

### 1.1 總覽

| # | 網站 | 網址 | 語言 | 支援 Champions | 一句話定位 |
|---|---|---|---|:--:|---|
| 1 | Limitless VGC | limitlessvgc.com | 英 | 是 | 官方大賽的賽果、隊伍、選手資料庫 |
| 2 | Limitless 賽事平台 | play.limitlesstcg.com | 英 | 是 | 社群線上賽的報名與賽果平台 |
| 3 | Smogon（使用率、圖鑑、論壇） | smogon.com | 英 | 是 | Showdown 的每月使用率原始資料、圖鑑、範例隊伍討論串 |
| 4 | Pokémon Showdown 傷害計算器 | calc.pokemonshowdown.com | 英 | 是 | 社群標準的傷害計算器 |
| 5 | NCP VGC 傷害計算器 | nerd-of-now.github.io/NCP-VGC-Damage-Calculator | 英 | 是 | 專為 VGC 雙打做的傷害計算器 |
| 6 | Nimbasa City Post | nimbasacitypost.com | 英 | 是 | 官方大賽報導與歷年資料 |
| 7 | MunchStats | munchstats.com | 英、西 | 是 | 天梯、遊戲內、賽事三種使用率並列的分析站 |
| 8 | MetaVGC | metavgc.com | 英、葡、西 | 是 | Champions 雙打的隊伍庫加攻略文章，自己也辦比賽 |
| 9 | PokéBase | pokebase.app | 英 | 是 | 資料庫、組隊、對戰模擬、賽事一站包 |
| 10 | ChampDex | champdex.com | 英（另有 ES 切換） | 是 | 一人開發的免費 Champions 工具箱 |
| 11 | Pokémon Champions Battle Data | championsbattledata.com | 英 | 是 | 天梯使用率資料庫，有公開 API 與付費組隊工具 |
| 12 | OP.GG Pokémon Champions | op.gg/pokemon-champions | 多語（頁尾列約 24 種） | 是 | 大型電競資料站開的 Champions 專區 |
| 13 | Reportworm（系列站） | reportworm.com | 英 | 是 | 官方大賽的排名、隊伍表、綜合統計 |
| 14 | RK9 | rk9.gg | 8 語（含日、韓，無中文） | 是（官方賽報名系統） | 官方大賽的報名與賽程系統 |
| 15 | Game8 | game8.co、game8.jp | 英、日 | 是 | 攻略媒體：強度排行、隊伍打法、工具 |
| 16 | GameWith | gamewith.jp、gamewith.ai | 日、英 | 是 | 攻略媒體：使用率、隊伍打法、計算器、測驗 |
| 17 | バトルデータベース チャンピオンズ | champs.pokedb.tokyo | 日 | 是 | 天梯資料加「玩家隊伍文章」的索引 |
| 18 | ポケノート | pokesol.app | 日 | 是 | 玩家發表隊伍文章的平台，附計算器 |
| 19 | リバティノート | liberty-note.com | 日 | 是 | 雙打專門媒體：上位隊伍整理、訪談、行事曆 |
| 20 | 官方網站 | champions.pokemon.com | 英（只看 en-us） | 是 | 官方消息、規則說明、線上賽公告 |
| 21 | PokeSynergy | pokesynergy.app | 英 | 是 | 會說明理由的組隊檢查工具 |
| 22 | PokeTools | poketools.com | 英 | 部分 | 54 個小工具的合集 |
| 23 | VGC Guide | vgcguide.com | 英 | 否 | 純文字的 VGC 入門教材 |
| 24 | Devon Corp Press | devoncorppress.squarespace.com | 英 | 部分 | VGC 資源總表、PASRS 發布處 |

另外兩個確認存在但 Champions 支援看不出來的：PokémonDB（pokemondb.net，沒有 Champions 專區）、MetaScopeVGC（metascope.net，首頁沒寫涵蓋哪些規則）。放在第 3 節。

### 1.2 逐站紀錄

每站固定寫八項。A～G 是 `00-framework.md` 的七大類（A 資料查詢、B 對戰工具、C 環境情報、D 隊伍庫、E 內容、F 平台能力、G 解釋與學習）。

#### 1. Limitless VGC
- **網址／語言**：limitlessvgc.com／英文。
- **定位**：頁面自稱「Pokémon Video Game tournament database」。
- **主要功能**：C（依賽事算的使用率排行、賽事清單，可按時間、賽事類型、規則、地區篩選）、D（賽事隊伍，預設「近三個月」，每頁 25 隊共 36 頁）。另有選手排名（歷來最佳、獎金最高）。沒有 A、B、E、G。
- **支援 Champions**：是。首頁寫目前規則是「Regulation Set M-C」，最新一場是 2026-10-31 的 Regional Gdańsk（758 人）。
- **值得學**：把「賽事 → 隊伍 → 選手」三種頁面互相連起來。Pikalytics、TrainerOps 的隊伍來源都連回這裡，它是整個生態的上游。
- **資料來源**：頁面沒寫。
- **收費**：沒看到廣告、捐款或訂閱。

#### 2. Limitless 賽事平台
- **網址／語言**：play.limitlesstcg.com／英文。
- **定位**：多種遊戲共用的線上賽平台，Pokémon VGC 是其中一種。
- **主要功能**：C（已結束與即將舉辦的賽事清單；即將舉辦的 VGC 線上賽當天約 103 場，每場顯示主辦、報名人數、用 Switch 還是模擬器）、F（帳號、通知偏好）。另有給開發者的 API 文件。
- **支援 Champions**：是。規則篩選有 Regulation Set M-A、M-B、M-C，賽事名稱直接寫「Pokémon Champions」。
- **值得學**：開放 API。文件寫大部分端點不需要金鑰，但有流量限制。（文件沒明寫是否涵蓋 VGC，這一點**未確認**。）
- **資料來源**：平台本身就是來源（主辦人在上面辦比賽）。
- **收費**：沒看到。

#### 3. Smogon
- **網址／語言**：smogon.com（使用率在 `/stats/`、圖鑑在 `/dex/`、論壇在 `/forums/`）／英文。
- **定位**：Pokémon Showdown 的姊妹社群，公開每月使用率原始檔。
- **主要功能**：A（圖鑑有「Champions」世代，含招式、特性、道具、屬性、賽制）、C（每月使用率文字檔）、D／E（論壇裡的範例隊伍與強度排行討論串）。
- **支援 Champions**：是。2026-10 的使用率資料夾有 24 個 Champions 相關檔案，包含 `gen9championsvgc2026regmc` 與它的三戰兩勝版，各分四個積分門檻（0、1500、1630、1760）。
- **值得學**：資料完全公開、格式固定，所以 Pikalytics、MunchStats、MetaVGC 都拿它當底。
- **資料來源**：Pokémon Showdown 天梯對戰。**注意這是模擬器的資料，不是遊戲內的資料。**
- **更新**：每月一次。2026-10 的資料夾是 2026-11-01 上傳的。
- **其他**：論壇的「Champions VGC Regulation M-B Sample Teams」討論串有 14 支隊伍，每支只有一行標題和 pokepast.es 連結，沒有租借碼、沒有打法說明；2026-07-11 發表、已鎖定，頁面上沒有連到 M-C 版。
- **收費**：沒看到。

#### 4. Pokémon Showdown 傷害計算器
- **網址／語言**：calc.pokemonshowdown.com／英文。
- **定位**：社群標準傷害計算器。
- **主要功能**：B（傷害計算）。
- **支援 Champions**：是。模式按鈕有「Champions」，和「One vs One」「Random Battles」並列（不是列在世代裡）。可選單打或雙打。
- **值得學**：一對多、多對一的計算模式。
- **資料來源**：頁尾寫「Created by Honko; maintained by Austin, Kris, and others」。
- **收費**：沒看到。

#### 5. NCP VGC 傷害計算器
- **網址／語言**：nerd-of-now.github.io/NCP-VGC-Damage-Calculator／英文。
- **定位**：頁面標題是「VGC 2026: Champions Damage Calculator」。
- **主要功能**：B（傷害計算，可存自訂配置、匯入、匯出隊伍）。
- **支援 Champions**：是。世代列有「CHAMP」，更新說明寫已加入 Regulation M-C 的新寶可夢、道具、招式、特性。同一段也寫「This generation's set updates are still under construction」。
- **值得學**：專門針對 VGC 雙打的場地條件（天氣、場地、牆、範圍招式）。
- **資料來源**：頁面列出維護者與原作者；沒有日期。
- **收費**：沒看到。

#### 6. Nimbasa City Post
- **網址／語言**：nimbasacitypost.com／英文。
- **定位**：官方大賽的報導站，NCP 計算器的母站。
- **主要功能**：C（2027 賽季行事曆、每場地區賽的報導）、E（Team Report、歷年賽季存檔）。導覽列另有 Player Profile、Damage Calc。
- **支援 Champions**：是。最近五篇都是 2026 年 10 月到 11 月的地區賽，寫明用「Regulation Set M-C」。
- **值得學**：每場賽事固定格式的報導（人數、賽制、轉播陣容）。
- **資料來源**：頁面沒寫。
- **收費**：沒看到。

#### 7. MunchStats
- **網址／語言**：munchstats.com／英文、西班牙文。
- **定位**：個人做的使用率分析站。關於頁寫它是因為 Pikalytics 更新太慢才開始做的。
- **主要功能**：
  - C：使用率（每隻有招式、同隊夥伴、道具、特性、性格與能力點分配）、Insights 頁（賽事勝率、晉級率、近 15 天對前 15 天的升降、核心組合、天梯與賽事的差異）、賽事。
  - B：傷害計算器。Tools 頁另有 Spread Solver、Draft Scout。
  - D：隊伍頁，可用「隊伍含全部／任一指定寶可夢」搜尋，可勾「Has EV Spreads」「Has Replica Code」「Has Team Report」。
  - G（沾邊）：Replays 頁可搜尋公開的 Showdown replay；另有兩個 Chrome 擴充功能，一個存檔並分析自己的 replay（頁面說是受 PASRS 啟發），一個在 Showdown 上模擬實體賽的條件（例如隱藏對戰資訊、出招後不能改）。
- **支援 Champions**：是，而且同時有三種來源：Showdown 的 Champions 賽制、遊戲內的「In-Game Doubles／Singles」、賽事。
- **值得學**：**它把「遊戲內 Battle Data」自己抓下來**。關於頁寫有一套自動化系統直接讀遊戲內的 Battle Data 畫面，235 隻、兩種賽制，掃一輪約兩個半小時。
- **資料來源**（關於頁寫得很清楚）：天梯是 Showdown 每月使用率；隊伍是社群的 VGCPastes 試算表；線上賽是 Limitless；官方大賽是 RK9 的公開對戰表與名單；replay 只收公開的。
- **更新**：Showdown 資料每月；遊戲內資料每晚；replay 每 12 小時，只保留近一個月。
- **收費**：無廣告、無追蹤，有 Ko-fi 捐款按鈕。Android 應用程式測試中。

#### 8. MetaVGC
- **網址／語言**：metavgc.com／英、葡、西。
- **定位**：自稱「an evidence-first Pokémon Champions doubles hub」。
- **主要功能**：
  - D：隊伍庫，可按寶可夢、天氣類型（晴、雨、沙、雪、冷門超級進化）分類，可用招式、道具、特性搜尋，附 Showdown 格式與 Pokepaste 連結。
  - C：賽事清單、規則頁、使用率。
  - E：攻略文章約 20 篇（見下）、論壇。
  - B：組隊器。（傷害計算器與速度工具只在搜尋摘要看到，**未親眼確認**。）
- **支援 Champions**：是，整站只做 Champions。
- **值得學**：文章題目很貼近學習者的問題，例如「How to Play Dual Weather」「Leads in Regulation M-A」「VGC Speed Control Logic: Tailwind vs Trick Room」「How to Counter Incineroar」。最新一篇是 2026-09-21。
- **資料來源**：頁面寫使用率來自 Pokémon Showdown 的使用率報告，再加上 Limitless 與官方賽事結果。
- **收費**：有廣告。去廣告方案寫「$29.99/year」，訂閱者在個人檔案與論壇貼文有標章。自己辦週賽（Limitless 上看得到「MetaVGC Arena #5」，74 人）。

#### 9. PokéBase
- **網址／語言**：pokebase.app／英文。
- **定位**：粉絲站，同時做 Champions、Pokémon GO、TCG Pocket。
- **主要功能**：
  - A：寶可夢、招式、特性、道具資料庫，速度線。
  - B：組隊器、全隊對全隊的傷害計算器、**Battle Sim**（和機器人對打、讓機器人自動打完並逐回合重播、批次模擬、兩隊比較）。
  - C：使用率與升降、賽事頁（寫「Last 6 months: 531 events · 60,903 entries」，可按規則與賽事類型篩選）、神秘禮物序號。
  - F：帳號、行動應用程式、Discord。
- **支援 Champions**：是。
- **值得學**：對戰模擬做到可以「批次跑很多場」來比較兩支隊伍，這是五站裡沒有的。（模擬的準確度**未驗證**。）
- **資料來源**：賽事頁沒寫來源。
- **收費**：有廣告。Pro 方案每月 $2.99 或一次買斷 $19.99，內容是去廣告、提高儲存上限（隊伍從 10 支變 1,000 支）、Discord 身分組。

#### 10. ChampDex
- **網址／語言**：champdex.com／英文（頁首有「EN ES」）。
- **定位**：首頁寫「Free trainer toolkit · 343 Pokémon · live meta · calc · builder」，一人開發。
- **主要功能**：A（圖鑑、特性、速度線）、B（組隊器、傷害計算器、能力點求解器）、C（使用率、賽事、新聞、活動、神秘禮物、賽季倒數）、D（Replica Teams、可把賽事前段隊伍帶進組隊器）、E（每日的「Field note」、Learn 區）。
- **支援 Champions**：是。首頁寫樣本是「From 3,516 teams in 93 Reg M-C tournaments, Oct 29 to Nov 12」，並寫 M-C 在 12 月 2 日結束。
- **值得學**：首頁直接說明樣本大小與日期區間；有「Data status」頁與 RSS；有「對戰中」的捷徑（直接算對當前最大威脅的傷害）。
- **資料來源**：頁面寫「Data from PokeAPI, Serebii and Limitless tournaments」。
- **收費**：沒看到廣告或訂閱，寫明免費。

#### 11. Pokémon Champions Battle Data
- **網址／語言**：championsbattledata.com／英文。
- **定位**：粉絲做的天梯使用率資料庫。
- **主要功能**：
  - A：寶可夢、招式、道具、特性一覽，速度線。
  - C：單打與雙打的使用率、每日趨勢、能力點分配、同隊夥伴、原型頁（空間、雨、晴、順風、場地）。
  - B：組隊器、傷害計算器、Solver；付費功能有隊伍評估、自動組隊、「對 2,800 多支近期隊伍做測試」。
  - F：Companion 應用程式（付費版寫有 Live Mode、辨識對手、Top Lead、掃描盒子）。
- **支援 Champions**：是。首頁寫涵蓋 Regulation M-A、M-B、M-C。
- **值得學**：**公開 API**。API 首頁回傳的資料顯示每天都有一個資料夾（最新是 2026-11-13），也有授權條款與使用規則頁。
- **資料來源**：只寫「rebuilt daily from ladder snapshots」，沒有說快照怎麼取得。
- **收費**：免費版可用組隊器、計算器、API。Pro 每月 €5 或每年 €45。

#### 12. OP.GG Pokémon Champions
- **網址／語言**：op.gg/pokemon-champions／介面語言很多（頁尾列約 24 種，含繁體中文；Champions 內容是否有繁中**未確認**）。
- **定位**：電競資料站 OP.GG 的 Champions 專區。
- **主要功能**：A（圖鑑、招式、道具、特性、屬性表、速度）、B（計算器、組隊器、寶可夢比較、隊伍屬性覆蓋）、C（單打與雙打排行、新聞、禮物）、D（Replica Teams 玩家分享租借碼、Sample Builds 玩家分享單隻配置）、強度排行製作器。
- **支援 Champions**：是。
- **值得學**：靠既有的大流量與多語架構，一次鋪滿所有基本功能。
- **資料來源**：沒寫排行怎麼來。頁面有一則公告說遊戲更新導致本季資料延遲；排行顯示「Updated Nov 9, 2026」。Best Trainer 排行顯示沒有資料。
- **收費**：有廣告，有「Remove Ads」會員。有手機與桌面應用程式。

#### 13. Reportworm（系列站）
- **網址／語言**：reportworm.com（入口）、standings.reportworm.com、champs.reportworm.com、meta.reportworm.com、reporter.reportworm.com／英文。
- **定位**：一位開發者（Mike W）做的一組站，都用官方大賽的公開資料。
- **主要功能**：
  - Standings：官方大賽的完整排名、隊伍表、使用率。
  - Champs：所有 Champions 官方大賽的綜合統計，分寶可夢與選手。
  - Meta：把官方與社群賽事中成績最好的隊伍整理成「目前環境快照」，只收三戰兩勝、公開隊伍表的賽事。
  - Reporter：最早的 Reportworm，分析自己的 Showdown replay。作者自己寫「會再維護一陣子，但可能有其他維護得更好的工具」。
- **支援 Champions**：是。Champs 首頁寫 2026 賽季的世界冠軍是日本的 Takuma Yamazaki，並說只要 Champions 還有公開隊伍表的賽事就會持續更新。
- **值得學**：每個站都開源（GitHub），而且把資料來源寫在頁面上。
- **資料來源**：官方賽事來自 RK9 Labs、playlatam、Pokedata；社群賽事來自 Battlefy、Limitless。
- **收費**：沒看到。

#### 14. RK9
- **網址／語言**：rk9.gg／英、德、西、法、義、葡、日、韓。
- **定位**：官方大賽的報名與賽務系統。
- **主要功能**：C（即將舉辦與已結束的官方賽事清單，各有日期、地點、遊戲別連結）。
- **支援 Champions**：是。下一場是 2026-11-20 到 22 的拉丁美洲國際賽（聖保羅）；賽事的遊戲別標「VG」。
- **值得學**：它是官方賽資料的源頭，MunchStats、Reportworm 都從這裡取對戰表與名單。
- **收費**：沒看到。

#### 15. Game8
- **網址／語言**：game8.co/games/Pokemon-Champions（英）、game8.jp/pokemon-champions（日）。
- **定位**：攻略媒體，編輯團隊寫稿。
- **主要功能**：
  - A：寶可夢、招式、特性、道具一覽。
  - B：傷害計算器、組隊器；日文版另有「素早さ調整」。
  - C：活動與線上賽清單、新聞、天梯指南（規則 M-A 到 M-C 與各賽季）；日文版有使用率排行。
  - D：英文版有 Team Sharing Board（玩家分享）；日文版的「上位構築」寫收錄天梯前 300 名與賽事前 100 名。
  - E：強度排行（單打、雙打、超級進化、道具）、新手指南。
  - **G：隊伍打法指南**。雙打有雨、晴、雪、沙、高速進攻、戲法空間、平衡、滅亡之歌八種；單打另有三種。
- **支援 Champions**：是。
- **值得學**：**它有寫「這隊怎麼打」**。我開的「Best Rain Team」頁，除了六隻的完整配置，還有每隻的角色（例如 Rain setter、Healing support）、隊伍強項與弱點、建議先發、對其他天氣隊怎麼辦、哪些寶可夢剋這支隊。日文版的環境上位隊伍頁同樣有「選出」「立ち回り」「弱點」。
- **要注意**：更新不一致。英文版雨隊頁最後更新是 2026-06-24，內文寫 M-B；英文首頁寫 2026-09-29 更新，但最上面的新聞還在講「手機版預計 6 月 17 日推出」。日文版首頁是 2026-11-10。
- **資料來源**：沒寫。
- **收費**：有廣告。日文版有可去廣告的付費「プレミアムプラン」；英文版有免費會員。

#### 16. GameWith
- **網址／語言**：gamewith.jp/pokemon-champions（日）、gamewith.ai/pokemon-champions（工具站，有英文版）。
- **定位**：攻略媒體，和 Game8 同類。
- **主要功能**：
  - A：寶可夢、招式、持有物一覽。
  - B：傷害計算器（可存計算紀錄、雲端儲存）、速度比較、組隊模擬器；工具站另有傷害表、耐久計算、強度排行製作、**對戰分析筆記**（記錄積分變化）、大賽積分模擬。
  - C：雙打使用率排行（寫「集計日：11/12(木) - シーズンM-8」，可按屬性與相剋篩選）、官方賽與配布資訊。
  - D：「みんなの構築」「みんなの育成論」（玩家投稿）、天梯上位隊伍整理。
  - E：新手攻略、用語表、**ダメージ感覚クイズ**（傷害感覺測驗；只看到入口與一句說明，沒有實際開）。
  - **G：雙打最強隊伍排行**。
- **支援 Champions**：是。首頁最後更新 2026-11-13 09:26。
- **值得學**：**雙打最強隊伍排行頁的寫法**。10 支隊伍分三級，每支有隊伍 ID、概要、**基本選出（先發兩隻、後發兩隻）、打法（開局與收尾）、針對特定對手的選出調整**。文末列出執筆者的雙打比賽資歷。
- **資料來源**：使用率頁說同樣的數字可以在遊戲內的「バトルデータ」看到，但沒有明說本站數字是不是從那裡來。分級標準沒寫。
- **收費**：有廣告（標 PR 的推薦遊戲與橫幅）。計算紀錄與留言要免費註冊。

#### 17. バトルデータベース チャンピオンズ
- **網址／語言**：champs.pokedb.tokyo／日文。
- **定位**：自述是可瀏覽與搜尋 Champions 天梯資料的資訊站。同系列的朱紫版是 sv.pokedb.tokyo。
- **主要功能**：C（寶可夢使用率排行、使用率推移圖、訓練家排行）、A（速度線）、D（**構築記事検索**）。另有訓練家卡製作等小工具。
- **支援 Champions**：是。首頁寫「シーズンM-8 開催中」，雙打排行頁寫更新時間 2026/11/13 07:44。
- **值得學**：**它不自己寫內容，而是把玩家寫在別處的隊伍文章做成可搜尋的索引**。搜尋結果有 2,240 筆，每筆有賽季、名次與積分、訓練家、六隻寶可夢、文章標題（連到はてなブログ、note、X、YouTube、pokesol.app 等）。可按單雙打、賽季、規則、寶可夢、名次、積分、賽事類型（天梯、官方賽、朋友賽、線下賽）篩選。站上有「構築記事的刊登說明」頁。
- **資料來源**：寫明天梯資料是依遊戲內公開的資訊統計。朱紫版則寫資料來自 Pokémon HOME。
- **收費**：沒看到廣告或捐款。

#### 18. ポケノート
- **網址／語言**：pokesol.app／日文。任務清單裡的「ポケソル（pokesol）」查到的就是這個網域；站名顯示為「ポケノート」，頁面上另有「Pokémon Soldier」字樣。
- **定位**：玩家發表文章的平台。
- **主要功能**：E／D（文章分五類：構築記事、型紹介、大會・活動、環境考察、其他；每篇標單打或雙打、規則、賽季、作者）、B（傷害計算、隊伍管理）、F（登入）。
- **支援 Champions**：是。首頁的新文章都是 M-7 賽季的隊伍文章，多數在 3 到 9 天前發表。**我看到的那一頁全部是單打**，雙打文章有多少**未確認**。
- **值得學**：把「寫文章」和「計算器、隊伍管理」放在同一站，降低玩家寫隊伍文章的門檻。
- **資料來源**：玩家自己寫。
- **收費**：沒看到。

#### 19. リバティノート
- **網址／語言**：liberty-note.com／日文。
- **定位**：自稱寶可夢雙打專門的資訊媒體。
- **主要功能**：C（官方賽預選、線上賽、PJCS、WCS 的結果；活動行事曆）、D（「上位まとめ」：每個天梯賽季結束後整理雙打前 100 名，M-1 到 M-7 都有）、E（隊伍文章、育成論、環境報告、新手文章、選手訪談、專欄）。自己辦比賽「てるチャレ」。
- **支援 Champions**：是。首頁寫正在更新 Champions 資訊；最新一篇是 2026-11-07。
- **值得學**：只做雙打，而且節奏固定。每季結束隔天左右就出前 100 名整理（例如 M-7 是 2026-11-04），並有世界冠軍訪談。
- **資料來源**：頁面沒寫前 100 名怎麼取得。
- **收費**：沒看到。

#### 20. 官方網站
- **網址／語言**：champions.pokemon.com／只看了 en-us。
- **定位**：遊戲官方站。
- **主要功能**：C（新聞，分 Regulations／Strategy、Championships、Online Competition 幾類）。
- **支援 Champions**：是。最新一則是 2026-10-22 的「Pokémon Champions Regulation M-C Overview」。
- **值得學**：官方自己會出「給地區賽的準備」這類策略文。
- **備註**：頁面上沒有使用率或排行。使用率在遊戲內（見 2.1 的說明）。

#### 21. PokeSynergy
- **網址／語言**：pokesynergy.app／英文。
- **定位**：自稱免費的 Champions 組隊器，強調檢查結果「explainable」。
- **主要功能**：B（組隊器會檢查弱點、攻擊覆蓋、速度計畫、環境威脅、夥伴適配；傷害計算；速度線）、D（Teams）。
- **支援 Champions**：是。威脅表標「Champions Doubles M-C M-6」。
- **值得學**：把「速度計畫」當成組隊檢查的一項。
- **資料來源**：寫明來自 championsbattledata.com。**當天威脅表的使用率全部顯示 N/A**，資料日期寫 2026-10-28。
- **收費**：沒看到。有 Discord。

#### 22. PokeTools
- **網址／語言**：poketools.com／英文。
- **定位**：自稱 54 個計算器、規劃器、追蹤器的免費合集，全部在瀏覽器執行、不用帳號。
- **支援 Champions**：部分。頁尾寫「Champions roster 231 Pokémon」，搜尋結果裡有它的 Champions 組隊器與強度排行頁（**沒有開**）。
- **值得學**：傷害計算直接用 `@smogon/calc` 函式庫，並在頁面上說明。
- **資料來源**：頁尾寫 PokeAPI、Pokémon Showdown、Smogon、TCGplayer。
- **收費**：Ko-fi 捐款。

#### 23. VGC Guide
- **網址／語言**：vgcguide.com／英文。
- **定位**：純文字的 VGC 基礎教材。
- **主要功能**：E（章節：Introduction、Battling、Teambuilding、Circuit、In Game Guide、Resources）。
- **支援 Champions**：否。頁面沒提 Champions，遊戲內指南還停在劍盾。
- **值得學**：教材的章節結構，和「Resources」頁只連到外部工具、不自己做。
- **收費**：Ko-fi 捐款，沒有廣告。

#### 24. Devon Corp Press
- **網址／語言**：devoncorppress.squarespace.com／英文。
- **定位**：VGC 社群刊物。這次看的是它的資源總表與 PASRS 發布頁。
- **主要功能**：E（「Up-to-Date VGC Resources」：把工具分成多用途、單一用途、創作者、Podcast、已停用五區，每個附一句說明）。
- **支援 Champions**：部分。資源表最後更新是 2026-05-21。另一頁寫「PASRS 7.0 is now ready for Pokémon Champions!!」（PASRS 是一份 Google 試算表，用來分析自己的 Showdown replay）。
- **值得學**：有一區專門列「已經停用的工具」，告訴讀者哪些不要再用。

### 1.3 這些站怎麼賺錢（看得到的才列）

| 方式 | 網站與頁面上寫的價格 |
|---|---|
| 去廣告訂閱 | MetaVGC（每年 $29.99）、PokéBase（每月 $2.99 或買斷 $19.99）、OP.GG（Remove Ads 會員，沒看價格）、Game8 日文版（プレミアムプラン，沒看價格） |
| 付費進階功能 | Champions Battle Data（Pro 每月 €5 或每年 €45：不限次數的隊伍評估、自動組隊、Companion 進階功能） |
| 捐款 | MunchStats、VGC Guide、PokeTools（都是 Ko-fi）；MetaScopeVGC（Patreon） |
| 廣告 | MetaVGC、PokéBase、OP.GG、Game8、GameWith |
| 沒看到任何收費 | Limitless、Smogon、兩個計算器、ChampDex、Reportworm、バトルデータベース、ポケノート、リバティノート、PokeSynergy |

---

## 2. 功能矩陣

格式與 `00-framework.md` 第 3.1 節相同：● 有、△ 有但不完整、○ 未見、？ 無法判斷。站太多，拆成兩張。只做單一功能的站（兩個計算器、RK9、VGC Guide、Devon Corp Press、PokeTools、Nimbasa City Post）不放進矩陣。

### 2.1 英文的資料與工具站

「Smogon」那一欄把 Smogon 圖鑑、使用率、論壇與 Showdown 的計算器、模擬器合在一起看。「CBD」是 Champions Battle Data。

| 功能 | Limitless | MunchStats | MetaVGC | PokéBase | ChampDex | CBD | OP.GG | Reportworm | Smogon |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **A. 資料查詢** | | | | | | | | | |
| 圖鑑 | ○ | △ | ● | ● | ● | ● | ● | ○ | ● |
| 招式／特性／道具一覽 | ○ | ○ | ？ | ● | △ | ● | ● | ○ | ● |
| 屬性相剋 | ○ | ○ | ？ | ？ | ？ | ？ | ● | ○ | ● |
| 速度線 | ○ | ？ | ？ | ● | ● | ● | ● | ○ | ？ |
| **B. 對戰工具** | | | | | | | | | |
| 傷害計算 | ○ | ● | ？ | ● | ● | ● | ● | ○ | ● |
| 速度比較 | ○ | ？ | ？ | ？ | ？ | ？ | △ | ○ | ○ |
| 組隊器 | ○ | ○ | ● | ● | ● | ● | ● | ○ | ● |
| 對位／對戰模擬 | ○ | ○ | ○ | ● | △ | △ | ○ | ○ | ● |
| 選出推薦 | ○ | ○ | ○ | ○ | ○ | △ | ○ | ○ | ○ |
| **C. 環境情報** | | | | | | | | | |
| 使用率 | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| 每週趨勢 | ？ | △ | ？ | ● | ？ | ● | ？ | ○ | ○ |
| 賽事列表與結果 | ● | ● | ● | ● | ● | △ | ○ | ● | △ |
| 官方消息與活動日曆 | △ | ○ | △ | △ | ● | ○ | △ | ？ | ○ |
| 規則更新 | ○ | ○ | ● | ？ | △ | ○ | ？ | ○ | ？ |
| **D. 隊伍庫** | | | | | | | | | |
| 賽事隊伍 | ● | ● | ● | ● | ● | △ | ○ | ● | △ |
| 玩家分享隊伍 | ○ | ○ | ● | ？ | ○ | ○ | ● | ○ | △ |
| 影片來源隊伍 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| 租借碼 | ？ | ● | ？ | ？ | ● | ？ | ● | ？ | ○ |
| 配點公開 | ？ | ● | ？ | ？ | ？ | ？ | ？ | ？ | ● |
| 篩選（原型、包含／排除） | △ | ● | ● | ？ | ？ | △ | ？ | ？ | ○ |
| **E. 內容** | | | | | | | | | |
| 文章／週報 | ○ | ○ | ● | ○ | △ | ○ | △ | ○ | △ |
| 教學指南 | ○ | ○ | ● | ○ | ？ | ○ | ○ | ○ | ？ |
| 測驗 | ○ | ○ | ○ | ○ | ？ | ○ | ○ | ○ | ○ |
| **F. 平台能力** | | | | | | | | | |
| 帳號與雲端儲存 | ● | ○ | ● | ● | ○ | △ | ● | ○ | ● |
| 多語 | 英 | 英、西 | 英、葡、西 | 英 | 英（有 ES） | 英 | 多語 | 英 | 英 |
| 通知或訂閱 | △ | ○ | ？ | ？ | △ | ？ | ？ | ○ | ？ |
| **G. 解釋與學習** | | | | | | | | | |
| 隊伍思路說明 | ○ | △ | △ | ○ | ○ | ○ | ○ | ○ | ○ |
| 戰術定位標籤 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| 控速分析 | ○ | ○ | △ | ○ | ○ | ○ | ○ | ○ | ○ |
| 對戰復盤（逐回合） | ○ | △ | ○ | △ | ○ | ○ | ○ | △ | △ |

標記的依據（只寫不直覺的）：
- **Limitless**：帳號與通知是賽事平台（play.limitlesstcg.com）的功能；「官方消息與活動日曆」標 △ 是因為平台有即將舉辦的社群賽清單，但不是官方消息。隊伍篩選只有時間、類型、規則、地區，沒看到包含／排除寶可夢。
- **MunchStats**：圖鑑標 △ 是因為使用率頁有種族值，但沒有獨立圖鑑。趨勢標 △ 是因為它用 15 天對 15 天與月對月，不是每週。隊伍思路標 △ 是因為有「Has Team Report」篩選（連到別人寫的報告）。復盤標 △ 是因為有 replay 搜尋與分析自己 replay 的擴充功能，對象是 Showdown，不是遊戲內對戰。**隊伍與 replay 清單當天沒載入，以上是依篩選條件判斷。**
- **MetaVGC**：隊伍思路與控速標 △，是因為有文章談（例如雙天氣怎麼打、順風對空間），但是文章層級，不是每支隊伍都有。傷害計算、租借碼只在搜尋摘要看到，標 ？。帳號標 ● 的依據是去廣告頁提到「個人檔案與論壇貼文」，首頁本身沒看到登入鈕。
- **PokéBase**：對戰模擬標 ●，依據是 Battle Sim 頁的說明。復盤標 △ 是因為自動對戰可以逐回合重播，但那是模擬出來的對戰，不是真實對戰的檢討。
- **ChampDex**：對戰模擬標 △，依據是首頁寫組隊器有「battle forecast」。通知標 △ 是因為有 RSS。
- **CBD**：對戰模擬標 △ 是因為有 Solver 與「對 2,800 多支隊伍測試」。選出推薦標 △ 是因為付費的 Companion 寫有「Top Lead」，沒看到實際畫面。賽事隊伍標 △ 是因為選單有「tournament teams」，沒有開。
- **OP.GG**：速度比較標 △ 是因為有「Pokemon Compare」與「Speed」，沒確認是不是能比較兩隻。
- **Reportworm**：復盤標 △ 指 Reportworm Reporter（分析自己的 Showdown replay）。
- **Smogon**：對戰模擬標 ● 指 Showdown 本身就是可以實際對打的模擬器，和 PokéOmni 那種「看對位表」不是同一回事。賽事與隊伍標 △ 指論壇的範例隊伍討論串（14 隊，只有連結）。復盤標 △ 指 Showdown 的 replay 可以逐回合重看，但沒有分析。

### 2.2 日文站、攻略媒體與其他

「對戰DB」是 バトルデータベース チャンピオンズ；「リバティ」是 リバティノート。

| 功能 | Game8 | GameWith | 對戰DB | ポケノート | リバティ | 官方站 | PokeSynergy |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **A. 資料查詢** | | | | | | | |
| 圖鑑 | ● | ● | ○ | ○ | ○ | △ | ？ |
| 招式／特性／道具一覽 | ● | ● | ○ | ○ | ○ | ○ | ？ |
| 屬性相剋 | ？ | △ | ○ | ○ | ○ | ○ | ● |
| 速度線 | △ | △ | ● | ○ | ○ | ○ | ● |
| **B. 對戰工具** | | | | | | | |
| 傷害計算 | ● | ● | ○ | ● | ○ | ○ | ● |
| 速度比較 | △ | ● | ○ | ○ | ○ | ○ | ？ |
| 組隊器 | ● | ● | ○ | △ | ○ | ○ | ● |
| 對位／對戰模擬 | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| 選出推薦 | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| **C. 環境情報** | | | | | | | |
| 使用率 | ● | ● | ● | ○ | ○ | ○ | △ |
| 每週趨勢 | △ | ？ | ● | ○ | △ | ○ | ○ |
| 賽事列表與結果 | △ | △ | ○ | △ | ● | △ | ○ |
| 官方消息與活動日曆 | ● | ● | ○ | ○ | ● | ● | ○ |
| 規則更新 | ● | ● | ○ | ○ | ？ | ● | ○ |
| **D. 隊伍庫** | | | | | | | |
| 賽事隊伍 | △ | △ | △ | ？ | ● | ○ | ？ |
| 玩家分享隊伍 | ● | ● | ● | ● | △ | ○ | ？ |
| 影片來源隊伍 | ○ | ○ | △ | ○ | ○ | ○ | ○ |
| 租借碼 | ？ | ● | ？ | ？ | ？ | ○ | ？ |
| 配點公開 | ● | ？ | ？ | ？ | ？ | ○ | ？ |
| 篩選（原型、包含／排除） | ？ | ？ | ● | △ | ？ | ○ | ？ |
| **E. 內容** | | | | | | | |
| 文章／週報 | ● | ● | △ | ● | ● | ● | ○ |
| 教學指南 | ● | ● | ○ | ○ | ● | △ | ○ |
| 測驗 | ○ | ● | ○ | ○ | ○ | ○ | ○ |
| **F. 平台能力** | | | | | | | |
| 帳號與雲端儲存 | ● | ● | ？ | ● | ？ | ○ | ？ |
| 多語 | 英、日 | 日、英 | 日 | 日 | 日 | 英（只看 en-us） | 英 |
| 通知或訂閱 | ？ | ？ | ？ | ？ | ？ | ○ | ？ |
| **G. 解釋與學習** | | | | | | | |
| 隊伍思路說明 | ● | ● | △ | △ | △ | ○ | ○ |
| 戰術定位標籤 | △ | ○ | ○ | ○ | ○ | ○ | ？ |
| 控速分析 | ○ | ○ | ○ | ○ | ○ | ○ | △ |
| 對戰復盤（逐回合） | ○ | ○ | ○ | ○ | ○ | ○ | ○ |

標記的依據：
- **Game8**：隊伍思路標 ●，依據是英文版雨隊頁與日文版環境上位隊伍頁（配置、先發、打法、弱點、剋星）。戰術定位標 △ 是因為每隻有一句角色說明，但是自由文字，不是可篩選的標籤。速度相關標 △ 指日文版的「素早さ調整」，沒有開。賽事隊伍標 △ 指日文版寫收錄天梯前 300 與賽事前 100，當天該區塊顯示讀取失敗。
- **GameWith**：隊伍思路標 ●，依據是雙打最強隊伍排行頁（隊伍 ID、先發後發、打法、對特定對手的調整）。測驗標 ● 指「ダメージ感覚クイズ」，只看到入口。工具站的「對戰分析筆記」是記積分走勢，不是逐回合復盤，所以復盤標 ○。
- **對戰DB**：隊伍相關的標記都指「構築記事検索」。它收的是連結，內容在別人的部落格，所以隊伍思路標 △、影片來源標 △（連結裡有 YouTube）。篩選可指定寶可夢、賽季、名次、積分、賽事類型，沒看到排除條件。
- **ポケノート**：隊伍思路標 △ 是因為站上的構築記事是玩家自己寫的，我沒有開單篇文章確認內容深度。
- **リバティ**：隊伍思路標 △ 同上（有隊伍文章與訪談，沒開單篇）。趨勢標 △ 指選單裡的環境報告。
- **PokeSynergy**：使用率標 △ 是因為當天全部顯示 N/A。控速標 △ 是因為組隊檢查裡有「speed plans」一項。

### 2.3 看完矩陣的三個觀察

1. **「隊伍思路說明」不再是全空的一列**。`00-framework.md` 寫「沒有任何一站解釋這隊怎麼打」，那是只看五站的結論。把日文與英文攻略媒體加進來後，Game8 和 GameWith 都有寫先發、打法、弱點。差別在於：它們寫的是編輯團隊挑的十來支「原型代表隊」，不是賽事或影片裡的每一支隊伍；語言是日文與英文；更新不一定跟得上（Game8 英文雨隊頁還停在 M-B）。
2. **「戰術定位標籤」「控速分析」「逐回合復盤」三列仍然幾乎是空的**。看到最接近的是 PokeSynergy 的速度計畫檢查、MetaVGC 的一篇控速文章、以及分析 Showdown replay 的工具（MunchStats 擴充功能、Reportworm Reporter、PASRS）。沒有任何一站對遊戲內的真實對戰做逐回合檢討。
3. **使用率、圖鑑、傷害計算是每一站都有的東西**。16 個放進矩陣的站裡，使用率只有 ポケノート、リバティノート、官方站沒有。這三樣確定不該自己重做。

---

## 3. 沒能確認、或已經不能用的站

| 網站 | 狀況 | 我看到什麼 |
|---|---|---|
| pokemon-zone.com（Champions 專區） | 擋自動存取，未能確認 | 直接開頁回 403。搜尋結果顯示它有隊伍排行、隊伍核心、隊伍搜尋、組隊器、賽事、天梯賽季、強度排行、速度線、規則頁，並寫資料可切換 Limitless 與 pokedata.ovh；**以上都沒有親眼看到頁面** |
| ポケモン徹底攻略（yakkun.com） | 擋自動存取，未能確認 | 直接開頁回 403。搜尋結果顯示有 `yakkun.com/ch/` 專區與 Champions 育成論（附留言）；**沒有親眼看到頁面** |
| Altema（altema.jp/pokemonchampions） | 擋自動存取，未能確認 | 回 403。搜尋結果顯示有雙打使用率前 50、招式與寶可夢資料庫 |
| Bulbapedia | 擋自動存取，未能確認 | 回 403。搜尋結果顯示有「Regulation Sets in Pokémon Champions」「List of Pokémon in Pokémon Champions」條目，M-C 還是草稿頁 |
| Porydex（porydex.com） | 擋自動存取，未能確認 | 回 403 |
| VGCPastes | 沒找到獨立網站 | `www.vgcpastes.com` 這個網域查不到。它其實是一份社群維護的 Google 試算表（Devon Corp Press 的資源表稱為「VGC Pokepaste Repository」），MunchStats 寫明隊伍資料取自它。**試算表本身我沒有開** |
| Babiri（babiri.net） | 看起來已停止 | 用瀏覽器開，被轉到一個不相干網域的中繼頁，沒有任何內容 |
| Falinks Teambuilder | 看起來已停止 | 被轉址到 `ww547.` 開頭的另一個主機，我沒有跟過去 |
| LaPrace（laprace.net）、VS Recorder（vsrecorder.app） | 存在，但讀不到內容 | 只讀到標題（Project Laprace、VS Recorder），VS Recorder 要登入 |
| PASRS | 只確認到發布公告 | Devon Corp Press 的公告寫 7.0 版已支援 Champions。它是 Google 試算表，我沒有開，也沒確認現在還能不能用 |
| Pokémon HOME 的 Champions 對戰資料 | 沒查到 | 朱紫的資料庫（sv.pokedb.tokyo）寫資料來自 HOME；Champions 版則寫來自「遊戲內公開的資訊」。一篇 2026-04-22 的教學文說使用率在遊戲內的 Battle → Battle Data 看。**HOME 上有沒有 Champions 資料，沒查到** |
| PokémonDB（pokemondb.net） | 存在，但沒有 Champions 專區 | 導覽列沒有 Champions；最新一則新聞停在 2026-03-25（預告 Champions 發售日） |
| MetaScopeVGC（metascope.net） | 存在，Champions 支援看不出來 | 自稱「The Analytics Engine for Competitive VGC」，有 Competitive Dex、Tournaments、Player Profiles，有 Patreon。首頁沒寫涵蓋哪些規則 |

---

## 4. 先前 12 個工具的變化

`line3-competitor-tools/01-tool-teardowns.md` 是 2026-06 寫的。這次只順手重看了其中幾個，沒重看的照舊。

| 工具 | 這次看到的變化 |
|---|---|
| Victory Road | 已全面轉到 Champions。導覽列有「2027 Season」（規則、賽季結構、世界賽資格名單）、Event Calendar、**Replica Teams**、World Cup of Pokémon VGC。Replica Teams 頁寫「Latest update: 05 November 2026」，按規則分區，再分「大賽決賽」「大賽前段」「天梯」三類，每筆有選手、最佳成績、六隻、隊伍代碼、部分有 VR Pastes 連結。首頁幾乎每天有貼文（最新 2026-11-12）。速度線仍然只有朱紫版。有西班牙文版。首頁沒看到廣告或 Patreon |
| pokedata.ovh | 選單多了「NEW Standings (VG/TCG)」「2027 Championship points」，舊的 VG 排名改標「(OLD)」。另外連到 metascope.net 的 VGC 統計。只看了選單，沒開排名頁 |
| pkmn.help | 還在運作。防守頁仍有太晶屬性選項，頁面上沒有出現 Champions 字樣 |
| Marriland Team Builder | **目前不能用**。頁面寫整站因安全考量凍結成唯讀，組隊器要重寫才會恢復。說明文字只提到朱紫與 Legends: Z-A，沒有 Champions |
| LabMaus | **疑似停更**。首頁的使用率榜是 Champions 的寶可夢，但「Latest News」最新一則是 2026-05-24，趨勢區塊還是朱紫時期的寶可夢，頁尾版權年份是 2024。賽事清單頁沒載入內容。是否還在更新**未確認** |
| Pokémon Showdown Teambuilder | 沒有重開。從 Smogon 使用率檔名可以確定 Showdown 有 Champions 的賽制（VGC 2026 Reg M-C 及三戰兩勝版等） |
| Pikalytics、Serebii、victorpoke | 已在 `00-framework.md` 更新，這裡不重複。補一點：搜尋結果顯示 Pikalytics 有以遊戲內對戰資料為名的賽制頁，但我開的那一頁回 404，**未確認** |
| bokevon、冷颯模擬器 | 這次沒有重看 |

---

## 5. B 部分：資訊網站可以提供的內容有哪些

把這次的 24 站，加上先前五站與 Victory Road，實際在做的內容整理成 30 種。「價值」是對一個**繁中、以學習為主**的站而言：高＝直接幫到學習者，而且繁中沒有人做好；中＝有用，但連出去或簡單整理就夠；低＝別人已經做得很好，或跟學習關係不大。

### 5.1 環境數據類

| # | 內容類型 | 哪些站有 | 資料從哪來 | 更新頻率（看得到的） | 價值 |
|---|---|---|---|---|---|
| 1 | 遊戲內天梯使用率（含招式、道具、夥伴） | 寫明來源的：MunchStats、對戰DB、CBD。有天梯排行但沒寫來源的：GameWith、OP.GG、Game8 日文版。先前五站也都有使用率，來源是不是遊戲內這次沒查 | 遊戲內的 Battle Data 畫面。MunchStats 寫明是自己自動讀畫面；對戰DB 寫「遊戲內公開的資訊」；CBD 只寫「ladder snapshots」 | MunchStats 每晚；CBD 每天；對戰DB 與 GameWith 當天有更新時間 | 中。數字本身連出去就好；但「用官方中文譯名解讀這週的前幾名」有價值 |
| 2 | Showdown 天梯使用率 | Smogon（原始檔）、MunchStats、MetaVGC、Pikalytics | Pokémon Showdown | 每月一次，月初公布 | 低。是模擬器玩家的資料，和遊戲內不完全一樣 |
| 3 | 賽事使用率 | Limitless、Reportworm、ChampDex、PokéBase、MunchStats、PokéOmni、TrainerOps、Pikalytics | Limitless（社群賽）、RK9（官方賽） | ChampDex 寫出日期區間（近兩週）；MunchStats 用近 30 天 | 中。同上，重點是解讀而不是再做一份表 |
| 4 | 使用率升降與趨勢圖 | PokéBase、CBD（每日）、對戰DB（推移圖）、MunchStats（15 天對 15 天）、PokéOmni（每週）、TrainerOps | 同 1、3 | 每日到每月不等 | 中。對學習者來說「為什麼升」比「升多少」重要 |
| 5 | 核心組合（常一起出現的兩到四隻） | MunchStats、Pikalytics、PokéOmni | 賽事隊伍 | 未見 | 中。可以直接接到「這兩隻為什麼搭」的教學 |
| 6 | 強度排行（tier list） | Game8、GameWith、OP.GG、ChampDex、Smogon 論壇 | 編輯或社群主觀判斷；多數沒寫標準 | Game8 英文版停在 2026-09-14 | 低。主觀、容易過時，而且每個攻略站都有 |
| 7 | 速度線表 | PokéBase、ChampDex、CBD、OP.GG、對戰DB、PokeSynergy；先前的 PokéOmni、victorpoke、Pikalytics | 種族值計算 | 隨規則更新 | 中。資料連出去即可；但「這條線為什麼重要」是學習內容 |

### 5.2 賽事與人物類

| # | 內容類型 | 哪些站有 | 資料從哪來 | 更新頻率 | 價值 |
|---|---|---|---|---|---|
| 8 | 賽事行事曆（即將舉辦） | RK9、Victory Road、Nimbasa City Post、リバティノート、Limitless 平台、ChampDex、TrainerOps | 官方公告、主辦人登錄 | Victory Road 幾乎每天有報名消息 | 高。繁中圈缺一份有台灣與亞洲場次、用中文寫的行事曆 |
| 9 | 賽果與隊伍表 | Limitless、Reportworm、RK9、Victory Road、PokéBase、MunchStats、リバティノート、TrainerOps、PokéOmni、Pikalytics | RK9 與 Limitless；Reportworm 另用 playlatam、Pokedata、Battlefy | 賽後數日內 | 中。量比不過；但挑幾場重要賽事做中文整理有價值 |
| 10 | 天梯前段名單整理 | リバティノート（每季雙打前 100）、Victory Road（Replica Teams 的天梯區）、對戰DB（訓練家排行） | 遊戲內排行加玩家自己公開的隊伍 | 每個賽季結束後（約四週一次） | 中 |
| 11 | 選手檔案與排名 | Limitless（歷來排名、獎金）、Reportworm Champs、對戰DB、Nimbasa City Post、PokéBase（奪冠次數）、pokedata.ovh | 賽果累計 | 隨賽事 | 低。跟學習關係小 |
| 12 | 選手訪談、冠軍戰報 | リバティノート（世界冠軍訪談）、Victory Road（Team Reports）、Nimbasa City Post、MetaVGC（地區賽報導） | 自己採訪或選手投稿 | 不定期 | 高。「高手怎麼想」正是學習者要的；繁中幾乎沒有 |
| 13 | 自己辦比賽 | MetaVGC（Arena）、Victory Road（月挑戰賽）、リバティノート（てるチャレ） | 自辦 | 每週到每月 | 低。現階段不是學習站該做的事 |

### 5.3 隊伍類

| # | 內容類型 | 哪些站有 | 資料從哪來 | 更新頻率 | 價值 |
|---|---|---|---|---|---|
| 14 | 租借碼（Replica）隊伍合集 | Victory Road、ChampDex、OP.GG、GameWith、MunchStats（可篩選）、PokéOmni、victorpoke | 選手公開、玩家分享 | Victory Road 約每一兩週 | 高。新手最直接的需求，我們已經在做 |
| 15 | 隊伍打法解說（先發、打法、弱點、對特定對手的調整） | GameWith、Game8、MetaVGC（文章）、Victory Road（Team Reports）；玩家自己寫的在 ポケノート、對戰DB 索引到的部落格 | 編輯團隊或選手自己寫 | GameWith 當週；Game8 英文版落後一個規則 | **高。這是我們的核心，而且繁中沒有人做** |
| 16 | 單隻寶可夢的配置指南（育成論） | Game8、GameWith、MetaVGC、OP.GG（玩家分享）、Smogon 圖鑑；yakkun（未確認） | 編輯或玩家投稿 | 不定期 | 中。量很大、容易過時；可以只做常見的十幾隻 |
| 17 | 玩家投稿隊伍或隊伍文章 | ポケノート、OP.GG、Game8（分享板）、GameWith、MetaVGC、victorpoke | 玩家 | 持續 | 中。品質不一（victorpoke 的例子見 `02-team-library-scoring.md`），需要審核 |
| 18 | 外部隊伍文章、影片的索引 | 對戰DB（2,240 篇，連到部落格、note、X、YouTube）、PokéOmni（影片來源）、TrainerOps（戰報連結） | 作者自行登錄或站方蒐集 | 每季後集中出現 | **高。這就是我們對 Fiske 影片做的事，日文圈已經證明這個模式行得通** |

### 5.4 教學與互動類

| # | 內容類型 | 哪些站有 | 資料從哪來 | 更新頻率 | 價值 |
|---|---|---|---|---|---|
| 19 | 新手教學（從零開始、用語、怎麼爬分） | Game8、GameWith、MetaVGC、VGC Guide、リバティノート、victorpoke | 自己寫 | 規則更換時 | 高。繁中的系統性雙打入門很少 |
| 20 | 機制專題（控速、天氣、先發選擇、怎麼對付某隻） | MetaVGC（順風對空間、天氣與場地、先發、如何對付熾焰咆哮虎）、官方站（策略文） | 自己寫 | MetaVGC 最新一篇 2026-09-21 | 高。可以直接和我們的控速分級、戰術定位標籤接起來 |
| 21 | 規則變更說明 | 官方站、Serebii、Victory Road、MetaVGC、Game8、GameWith | 官方公告 | 每次換規則（約兩到三個月） | 高。投入小，而且每次換規則大家都會找中文說明 |
| 22 | 官方消息、活動、神秘禮物序號 | 官方站、Serebii、PokéBase、ChampDex、OP.GG、Game8、GameWith、Victory Road、TrainerOps | 官方公告 | PokéBase 最新一筆序號是 2026-11-12 | 低。TrainerOps 有繁中版，Serebii 最快，連出去就好 |
| 23 | 測驗 | Pikalytics、GameWith（傷害感覺測驗） | 自己出題或用計算器產生 | 未見 | 高。只有兩站在做，很適合學習站；可以用我們已有的隊伍資料出題 |
| 24 | 傷害計算範例、傷害表 | GameWith 工具站（Damage Table）、Game8 隊伍頁內文 | 計算器 | 未見 | 中。可以放在隊伍說明裡，例如「這隻剛好撐得住哪一招」 |
| 25 | 資源總表（該用哪些工具） | Devon Corp Press、VGC Guide | 人工整理 | Devon Corp Press 最後更新 2026-05-21 | 高。投入很小，而且繁中沒有一份「哪個工具做什麼、哪些已經停用」的清單 |

### 5.5 工具與平台類

| # | 內容類型 | 哪些站有 | 資料從哪來 | 更新頻率 | 價值 |
|---|---|---|---|---|---|
| 26 | 傷害計算器、組隊器 | 幾乎每一站（見矩陣） | 多數基於 Showdown 的計算核心；PokeTools 寫明用 `@smogon/calc` | 隨規則 | 低。連出去 |
| 27 | 對戰模擬、隊伍自動評估 | PokéBase（Battle Sim）、CBD（Solver、對 2,800 多隊測試）、Showdown | 自己的模擬引擎 | — | 低。投入大、正確性難驗證 |
| 28 | Replay 搜尋與分析 | MunchStats（搜尋與擴充功能）、Reportworm Reporter、PASRS | 公開的 Showdown replay | MunchStats 每 12 小時 | 中。全部只支援 Showdown；遊戲內對戰沒有人做，但我們的 Game Log 也還是原型 |
| 29 | 開放資料與 API | Smogon（每月文字檔）、Limitless（API）、CBD（JSON API，免費版可用）、Reportworm（全部開源） | — | 每日到每月 | 高（對我們是資源，不是要做的內容）。使用率與賽果可以取用，不必自己蒐集；用之前要先讀各自的授權與使用規則 |
| 30 | 訂閱與社群：電子報、RSS、Discord、論壇、手機應用程式 | 電子報：TrainerOps（見 `00-framework.md`）。RSS：ChampDex。Discord：PokéBase、CBD、PokeSynergy。論壇或留言板：MetaVGC、Smogon、GameWith、Game8。應用程式：OP.GG、PokéBase、CBD（Companion）、MunchStats（Android 測試中） | — | — | 中。這次沒看到其他站有電子報；等有固定更新的內容再考慮 |

### 5.6 整理：哪些內容值得一個繁中學習站做

**高價值**（10 種）：賽事行事曆（8）、選手訪談與戰報（12）、租借碼隊伍（14）、隊伍打法解說（15）、外部影片與文章索引（18）、新手教學（19）、機制專題（20）、規則變更說明（21）、測驗（23）、資源總表（25）。其中 14、15、18 是我們已經在做的；21 和 25 投入最小。

**連出去就好**（低價值）：Showdown 使用率、強度排行、選手排名、官方消息與序號、計算器與組隊器、對戰模擬、自辦比賽。

**可以取用別人的資料來做**：遊戲內使用率（CBD 的 API）、賽果（Limitless）、Showdown 使用率（Smogon）。取用前要先確認授權。

---

## 6. 對 `00-framework.md` 的三點修正建議

1. **第 3.3 節「沒有任何一站解釋這隊怎麼打」要改寫**。應改成：「中文圈沒有；日文與英文的攻略媒體（GameWith、Game8）有，但只寫十來支原型代表隊，不是每一支賽事或影片隊伍。」我們的差異要說得更精確：繁中、每一支都有、內容來自實況主的講解而不是編輯部。
2. **「不做（連過去）」那一格可以更有把握**。使用率、圖鑑、計算器在這次看的站裡幾乎每站都有，而且有公開資料可取用。
3. **「觀察」那一格的測驗可以往上提**。這次 24 站裡只有 GameWith 有測驗（加上 Pikalytics 共兩站），而它正好適合學習站。

---

## 7. 來源網址

以下都是 2026-11-13 當天開過的頁面。標「（搜尋）」的是只在搜尋結果看到、沒有開頁或開頁失敗的。

**賽事與資料**
- https://limitlessvgc.com/ 、https://limitlessvgc.com/tournaments 、https://limitlessvgc.com/teams
- https://play.limitlesstcg.com/tournaments/completed?game=VGC 、https://play.limitlesstcg.com/tournaments/upcoming?game=VGC
- https://docs.limitlesstcg.com/developer.html
- https://rk9.gg/ 、https://rk9.gg/events/pokemon
- https://reportworm.com/ 、https://champs.reportworm.com/ 、https://meta.reportworm.com/ 、https://standings.reportworm.com/
- https://www.nimbasacitypost.com/
- https://victoryroad.pro/ 、https://victoryroad.pro/champions-replica/
- https://pokedata.ovh/ 、https://metascope.net/
- https://labmaus.net/ 、https://labmaus.net/tournaments

**使用率與綜合工具站**
- https://www.smogon.com/stats/ 、https://www.smogon.com/stats/2026-10/ 、https://www.smogon.com/dex/
- https://www.smogon.com/forums/threads/champions-vgc-regulation-m-b-sample-teams.3785112/
- https://www.smogon.com/forums/forums/vgc.127/ （開到的是 2016–2019 的舊版區）
- https://www.munchstats.com/ 、https://www.munchstats.com/insights/ 、https://www.munchstats.com/teams/ 、https://www.munchstats.com/replays/ 、https://munchstats.com/tools/ 、https://munchstats.com/about/
- https://metavgc.com/ 、https://metavgc.com/guides 、https://metavgc.com/ad-free
- https://pokebase.app/pokemon-champions 、https://pokebase.app/pokemon-champions/tournaments 、https://pokebase.app/pokemon-champions/battle-sim 、https://pokebase.app/pro
- https://champdex.com/
- https://championsbattledata.com/ 、https://championsbattledata.com/api/ 、https://championsbattledata.com/pokemon-champions-api/ 、https://championsbattledata.com/pro-tool/plans/
- https://op.gg/pokemon-champions 、https://op.gg/pokemon-champions/tutorial
- https://pokesynergy.app/
- https://www.poketools.com/about

**計算器**
- https://calc.pokemonshowdown.com/
- https://nerd-of-now.github.io/NCP-VGC-Damage-Calculator/

**攻略媒體與日文站**
- https://game8.co/games/Pokemon-Champions 、https://game8.co/games/Pokemon-Champions/archives/594143 （雨隊）、https://game8.co/games/Pokemon-Champions/archives/593883 （雙打強度排行）、https://game8.co/games/Pokemon-Champions/archives/592465 、https://game8.co/games/Pokemon-Champions/archives/590403
- https://game8.jp/pokemon-champions 、https://game8.jp/pokemon-champions/779319
- https://gamewith.jp/pokemon-champions/ 、https://gamewith.jp/pokemon-champions/554133 （傷害計算）、https://gamewith.jp/pokemon-champions/558167 （雙打最強隊伍）、https://gamewith.jp/pokemon-champions/558230 （雙打使用率）
- https://gamewith.ai/pokemon-champions/en
- https://champs.pokedb.tokyo/ 、https://champs.pokedb.tokyo/article/search 、https://champs.pokedb.tokyo/pokemon/list?rule=1 、https://sv.pokedb.tokyo/
- https://pokesol.app/
- https://liberty-note.com/ 、https://liberty-note.com/?s=トップ100

**官方、教材與資源表**
- https://champions.pokemon.com/en-us/
- https://www.vgcguide.com/
- https://devoncorppress.squarespace.com/resources/up-to-date-vgc-resources 、https://devoncorppress.squarespace.com/resources/the-release-of-pasrs-7-0
- https://www.operationsports.com/pokemon-champions-how-to-check-battle-data/ （說明使用率在遊戲內哪裡看，2026-04-22）
- https://pokemondb.net/
- https://www.stalruth.dev/ （Top Cut Explorer 等小工具，頁面沒提 Champions）

**先前工具的重看**
- https://www.pkmn.help/ 、https://marriland.com/tools/team-builder/

**沒能讀到內容的**
- 回 403：https://www.pokemon-zone.com/champions/ 、https://yakkun.com/ 、https://altema.jp/pokemonchampions/ 、https://bulbapedia.bulbagarden.net/wiki/Pokémon_Champions 、https://www.porydex.com/stats/current
- 網域查不到：https://www.vgcpastes.com/
- 被轉到別處：https://babiri.net/ 、https://www.falinks-teambuilder.com/
- 只讀到標題：https://laprace.net/ 、https://vsrecorder.app/
- 回 404：https://www.pikalytics.com/ai/team-usage/battledataregmbs3 、https://championsbattledata.com/pricing
- （搜尋）https://yakkun.com/ch/ 、https://yakkun.com/ch/theory/ 、https://bulbapedia.bulbagarden.net/wiki/Regulation_Sets_in_Pokémon_Champions 、https://www.pokemon-zone.com/champions/teams/ 、https://gamewith.jp/pokemon-champions/556734 （傷害感覺測驗）、https://www.smogon.com/forums/threads/vgc-regulation-m-b-viability-rankings.3785289/
