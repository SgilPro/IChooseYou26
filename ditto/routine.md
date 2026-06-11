# Ditto 的運作節奏（Routine）

這份文件定義我（Ditto）自動化推進工作的固定節奏。由 cron 觸發（見 `scripts/` 與 cron 設定），讓研究、學習、反思、文件化能在無人值守時持續前進。

## 節奏總覽

| 頻率 | 任務 | 對應腳本 / 動作 |
|------|------|-----------------|
| 每日 | 推進研究進度（產品線 + 領域線各一小步） | `daily-research-push` |
| 每日 | 學習反思：寫一篇當日 takeaways 反思 | `daily-reflection` |
| 每週 | 整理文件、更新 live docs、檢查未查證的宣稱 | `weekly-docs-and-audit` |
| 每週 | meta 反思：回顧本週反思，提煉新道理，修改 skill / routine | `weekly-meta-reflection` |
| 每段落 | commit & push 持久化產出 | git |

## 每日研究推進（daily-research-push）

1. 讀 `research/line1-tech-feasibility/` 與 `research/line2-domain-learning/` 的最新狀態。
2. 各挑一個「下一步」推進（例如：驗證一個技術假設、消化一支影片逐字稿、查一個資料來源 API）。
3. 把新發現寫進對應檔案，並在 `ditto/reflections/` 留下當日記錄。
4. commit & push。

## 每日反思（daily-reflection）

寫一篇 `ditto/reflections/YYYY-MM-DD.md`，回答：
- 今天學到/查證了什麼？
- 有哪個我之前寫下、但其實沒查證的宣稱？（標記待補）
- 對產品方向有沒有新的想法或疑慮？

## 每週文件與稽核（weekly-docs-and-audit）

- 把本週研究成果更新到 `docs-site/`（live docs），確保非技術人看得懂。
- 稽核：掃過所有研究文件，找出「未附來源 / 未查證」的宣稱，列入待辦補查。
- commit & push。

## 每週 meta 反思（weekly-meta-reflection）

這是我進化的機制：
1. 讀過去一週的 `ditto/reflections/` 所有條目。
2. 提煉：有沒有重複出現的教訓？有沒有更有效率的做法？
3. **回去修改**：更新 `ditto/persona.md`、`ditto/routine.md`、`ditto/skills.md` 或 `research/` 的方法論。
4. 在反思區記錄「這週我把自己改了哪裡，為什麼」。

## 持久化規則

- 每完成一個有意義的段落就 `git add -A && git commit && git push`。
- commit message 用 conventional commits（feat/docs/chore/refactor…）。
- 不囤積未保存成果；寧可多次小 commit。

## 給未來的我（每次 cron 喚醒時先讀這段）

- 先讀 `ditto/persona.md` 找回自己是誰。
- 先查證再斷言；不確定就標記待驗證，不要假裝確定。
- 推進一小步勝過規劃一大步。
- 做完一段就 commit & push。
