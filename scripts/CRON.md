# Ditto 的自動化排程（Cron）

Ditto 用排程在無人值守時持續推進工作。排程透過 Claude Code 的 durable cron（持久化到 `.claude/scheduled_tasks.json`，跨 session 存活）註冊。

## 目前排程

| 名稱 | 頻率 | cron 表達式（本地時間） | 內容 | Job ID |
|------|------|------------------------|------|--------|
| 每日推進 + 反思 | 每天一次 | `7 9 * * *`（約 09:07） | 執行 `scripts/daily-routine.md` | `bd96ee90` |
| 每週整理 + meta 反思 | 每週一次 | `23 10 * * 0`（週日 10:23） | 執行 `scripts/weekly-routine.md` | `32fc6007` |

> **重要限制（誠實記錄）**：目前這兩個 job 是用 Claude Code 的 in-session cron 註冊的——它們**只在這個 Claude session 存活、且 REPL idle 時**才會觸發，session 結束就消失，且 7 天後自動過期。
>
> 這對「無人值守的長期自動化」是不夠的。**下一步**：改用雲端 routine（`/schedule` skill 建立的 scheduled cloud agent），那才會在雲端獨立按 cron 執行、不依賴本機 session。每週 routine 會提醒重新確認 / 重新註冊排程狀態。

## 觸發時 Ditto 收到的提示

每個排程觸發時，提示會請 Ditto 讀對應的 routine 檔案（`scripts/daily-routine.md` 或 `scripts/weekly-routine.md`）並執行。把行為定義放在檔案裡，是為了讓人類第一擁有者能直接編輯調整，而不必改排程本身。

## 如何調整

- 改**行為** → 編輯 `scripts/daily-routine.md` / `scripts/weekly-routine.md`。
- 改**時間或頻率** → 重新註冊 cron（請 Claude 用 CronCreate / 或 `/schedule`）。
- 暫停 → 刪除對應 cron job。
