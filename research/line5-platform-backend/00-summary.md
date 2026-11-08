# 第五線：IChooseYou 平台後端 — 一頁摘要

> 2026-11-08 · Ditto · 回應 goal/261108_1 第 2 項。本線**只做理解與規劃，不實作**。
> 細節見：`00-action-plan.md`（行動計畫）、`01-reference-sites.md`（參考網站拆解）、`02-schema.md`（資料庫設計）、`03-notion-migration.md`（Notion 搬家步驟）。

## 第一擁有者要什麼（我的理解）

把現在只會「看影片做 Game Log」的靜態網站，變成一個**有資料庫的隊伍資料站**：
1. 接第一線（資料線）從 Fiske Pokemon 頻道抽出的影片與隊伍資料。
2. 接第一擁有者自己在 Notion 記錄的隊伍資料庫。
3. 參考 victorpoke-champions.com 與 Pikalytics 那種「分享隊伍 / 看使用率」的呈現方式。
4. 費用壓到最低：前端繼續放 GitHub Pages，後端用 Firebase / Supabase 等免費方案。

## 我的建議：三個階段，先不要急著接後端

| 階段 | 做什麼 | 要不要後端 | 預估 | 月費 |
|---|---|---|---|---|
| **Phase 1 靜態資料站** | 把第一線的 JSON + Notion 匯出的 JSON，在 build 時打包進現有 Vite app；做隊伍列表、隊伍頁、寶可夢頁（我們自己資料的使用率與常見隊友）、規則頁 | 不要 | 3–5 天 | US$0 |
| **Phase 2 接 Supabase** | 開 Supabase Free，把同一份資料灌進 Postgres；Google 登入；第一擁有者可在網頁上直接校對、修改隊伍 | 要（免費） | 5–7 天 | US$0 |
| **Phase 3 社群功能** | 任何人登入後可分享隊伍、分享碼、匯入/匯出 Showdown 格式、熱門排序、檢舉 | 要 | 7–10 天 | US$0 起，超量才付 |

**為什麼先靜態？** 第一線的資料本來就是 JSON 檔、放在 repo 裡有版本紀錄；Notion 匯出一次也是 JSON。只有「要在網頁上登入並編輯」這件事才真正需要後端。先把頁面和資料結構做對，之後灌進資料庫只是換個放法，不用重做。

**為什麼選 Supabase 而不是 Firebase？** 我們的資料天生是關聯式的（隊伍 → 成員 → 圖鑑；隊伍 → 規則組；隊伍 ↔ 標籤），和 Notion 的 relation 一對一對得上；Supabase 是 Postgres，可以直接寫 SQL 算使用率、常見隊友。Firebase Firestore 是 NoSQL，這類「跨表統計」要自己預先算好再存，日後想換平台也難搬。Supabase Free 的主要缺點是**一週沒人用會被暫停**（[來源](https://supabase.com/pricing)），可用排程 ping 解決。

## 需要第一擁有者拍板的事（詳見行動計畫第七節）

1. 後端選 Supabase（我的建議）還是 Firebase？
2. Notion 之後還要不要繼續當編輯介面？（一次性搬家 vs. 持續同步）
3. 會員限定影片的隊伍，網站上要公開到什麼程度？
4. 寶可夢圖片用哪個來源？（官方圖鑑圖有版權疑慮；PokeAPI sprites 較安全）
5. Phase 3「開放任何人投稿」要不要做、何時做？

## 我沒辦法查證、請注意的事

- victorpoke 的隊伍頁是 JavaScript 動態渲染，我這次沒有瀏覽器工具，**沒有親眼看到畫面**；我拆的是它的程式碼包（API 端點、介面文字、排序選項），拆解結果在 `01-reference-sites.md`。
- pokepast.es 的 JSON 端點（`/{id}/json`）來自先前研究，我這次沒有找到可測的 paste 編號，**未實測**。
