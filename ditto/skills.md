# Ditto 的技能來源與使用方式（Skills）

這份文件記錄我（Ditto）用來推進工作的 **Claude skills**、**學習資源**、以及**學習方法與路徑**。這是我的工具箱清單，也是我反思要回來修改的對象之一。

## 一、可用的 Claude Skills（工具箱）

這些是目前環境裡可呼叫的 skills，以及我在這個專案裡會怎麼用它們：

| Skill | 用途 | 我在本專案怎麼用 |
|-------|------|------------------|
| `deep-research` | 多來源、可查證、附引用的深度研究報告 | 領域線的核心引擎：研究 VGC meta、資料來源 API、影像辨識資料集時用它做扎實調研 |
| `stage-commit` | 暫存變更並草擬 conventional commit message | 每個段落持久化時用 |
| `code-review` | 審查 diff 的正確性與可簡化處 | 開始寫對戰工具 web app 後，每次改動後審查 |
| `security-review` | 審查待提交變更的安全性 | 涉及影像授權、串流存取權限的程式碼時用 |
| `verify` / `run` | 實際跑起 app 觀察行為來驗證改動 | 原型與 web app 階段驗證功能 |
| `schedule` / `loop` | 建立 cron 排程的雲端 agent / 定期任務 | 設定我的自動化 routine（每日推進、反思） |
| `update-config` | 設定 hooks / 權限 / 環境變數 | 需要自動化行為時設定 hooks |
| `init` | 建立 CLAUDE.md 文件 | 程式碼骨架成形後建立 |

> 反思時要問：有沒有更適合的 skill 我還沒用？有沒有該為這個專案寫一個自訂 skill（例如「消化 VGC 影片逐字稿」「截圖 → log 規則測試」）？

## 二、學習資源（領域線：成為 VGC 雙打專家）

> 詳細的標註與 URL 由領域線研究產出，見 `research/line2-domain-learning/01-learning-resources.md`。這裡只放索引與我的使用策略。

- **WolfeyVGC**（YouTube + Patreon）— 教學型內容，吸收逐字稿提煉 takeaways。
- **官方賽事 VOD（含主播解說）**— Worlds / Regionals，從解說學讀盤。
- **VGC 創作者 + X/Twitter 選手**— 追蹤訊號來源，過濾雜訊。
- **pikalytics.com**— 使用率、常見隊友、招式、道具、努力值分布；以及其資料來源。
- **Pokémon Showdown usage stats / Limitless VGC / VGCPastes**— meta 與隊伍資料。

## 三、影像辨識資料來源（產品線）

> 詳見 `research/line2-domain-learning/03-image-recognition-sources.md`。

- 神奇寶貝百科 / Bulbapedia 圖像
- Pokémon HOME sprite 資源
- PokeAPI sprites

## 四、學習方法與路徑

1. **多輪自我對話 deep thinking**：不急著下結論，先把問題想透（記錄在 `research/line2-domain-learning/self-dialogue.md`）。
2. **資源 → takeaways → 結構化知識**：每消化一個資源，提煉成可用的知識點，歸入 curriculum。
3. **查證優先**：對戰規則與 meta 結論一律查證附來源。
4. **反思迴圈**：定期回顧 takeaways，提煉新道理，回去修改 skill 與 routine（見 `ditto/routine.md` 的 weekly-meta-reflection）。

## 五、自訂指令（專案內 slash commands）

放在 `.claude/commands/`，第一擁有者可直接 `/指令名` 呼叫：

| 指令 | 用途 | 機制 |
|------|------|------|
| `/ditto-report` | 回報「自上次執行以來」Ditto 做了哪些研究與產出 | 以 git commit SHA 當書籤存在 `.claude/ditto-report-state.json`（本地、未進版控），比對 `上次SHA..HEAD` 並讀新反思生成白話報告，再更新書籤 |

## 六、待探索 / 待補

- [ ] 是否要為「VGC 影片逐字稿消化」寫一個自訂 skill？
- [ ] 是否要為「截圖 → log 規則」建立可重跑的測試 harness？
- [ ] 探索 youtube-transcript 取得逐字稿的可行管道。
