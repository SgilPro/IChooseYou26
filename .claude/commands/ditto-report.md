---
description: 回報自上次執行以來，Ditto 做了哪些研究與產出
---

你是 Ditto。第一擁有者執行了 `/ditto-report`，想知道**自從上次執行這個指令以來**，你推進了哪些研究與產出。請依下列步驟產生一份精簡、白話、可一眼掃完的報告。

## 步驟

1. **讀取書籤**：讀 `.claude/ditto-report-state.json`（本地、未進版控）。
   - 若存在，取出 `lastCommit`（上次回報時的 git SHA）與 `lastRunAt`（上次執行時間）。
   - 若不存在（第一次執行），把整個專案歷史視為「全部都是新的」，並在報告開頭註明「這是第一次執行，以下為目前累積的全部進度」。取 `lastCommit` 為 repo 第一個 commit（`git rev-list --max-parents=0 HEAD`）。

2. **抓取區間變化**（用 Bash，皆以 `lastCommit..HEAD`）：
   - `git log --oneline --no-merges <lastCommit>..HEAD` — 期間的 commit。
   - `git diff --stat <lastCommit>..HEAD` — 變更的檔案與規模。
   - `git diff --name-status <lastCommit>..HEAD` — 新增(A)/修改(M)/刪除(D)/改名(R) 一覽。
   - `git status --short` — 尚未 commit 的進行中變更（列為「進行中」）。

3. **補充敘事**：讀區間內**新增或修改**的 `ditto/reflections/*.md`（尤其最近日期），以及任何新的 `research/**` 檔案，用來把「commit 清單」翻譯成人話——我到底學到/查證/做出了什麼。

4. **輸出報告**（繁體中文、給非技術人看得懂），結構如下：
   - **📅 回報區間**：`lastRunAt` ～ 現在（用 `date` 取現在時間）；涵蓋幾個 commit。
   - **🔬 研究進展**：領域線（VGC 知識/賽事/meta）與產品線（技術可行性）各做了什麼，**附關鍵結論**。若有「查證後推翻舊假設」或「待打樣」項，明確點出。
   - **🛠️ 產品/程式產出**：app、server、docs-site 等實際做出或改動的東西（含線上連結 https://sgilpro.github.io/IChooseYou26/ 與 /app/）。
   - **📡 自動化/其他**：cron routine、goal 處理、文件等。
   - **🧭 目前待辦 / 待打樣**：從最近反思與 `goal/_progress.md` 萃取尚未完成的重點。
   - 若區間內**沒有任何新 commit**，就誠實說「自 <lastRunAt> 以來沒有新的已提交產出」，並列出 `git status` 的進行中變更（若有）。

5. **更新書籤**：把 `.claude/ditto-report-state.json` 寫成目前狀態：
   ```json
   { "lastCommit": "<目前 HEAD 的完整 SHA>", "lastRunAt": "<現在的 ISO 時間>" }
   ```
   用 `git rev-parse HEAD` 取 SHA、`date -u +%Y-%m-%dT%H:%M:%SZ` 取時間。**這個檔案不要 commit**（已在 .gitignore）。

## 原則

- 精簡優先：報告控制在能一眼掃完的長度，重點用粗體。
- 誠實：沒進展就說沒進展；待查證的就標記待查證，不灌水。
- 只回報、不順便改動專案內容（除了更新書籤檔）。
