# 寶可夢對戰工具（Pokémon VGC Battle Tool）

一個把寶可夢對戰影像，自動變成可復盤紀錄的工具。第一個功能是 **Game Log**：對戰影像 → 定時截圖 → 篩選關鍵畫面 → 判讀成文字事件 → 分回合分組 → 對戰紀錄。

長期願景：成為類似 [pikalytics](https://www.pikalytics.com/) / [serebii](https://www.serebii.net/) 的完整對戰工具站，但更貼近實戰復盤。

## 兩位擁有者

- **第一擁有者**：人類，決定方向與最終取捨。
- **第二擁有者 Ditto**：自動化的 AI 共同擁有者，負責推進研究、學習對戰知識、文件化與開發。見 [`ditto/`](ditto/)。

## 專案結構

```
ditto/                  # Ditto 的人格、運作節奏、技能、學習反思
  persona.md            #   我是誰
  routine.md            #   自動化運作節奏
  skills.md             #   技能來源與學習方法
  reflections/          #   學習反思區（每日 / 每週 meta 反思）
research/               # 兩條研究主線
  line1-tech-feasibility/   # 產品線：技術可行性 + user flow
  line2-domain-learning/    # 領域線：如何學會 VGC 雙打知識
docs-site/              # 對外 live docs 靜態網站（非技術人可讀）
scripts/                # cron routine 提示詞與排程說明
main-task.md            # 第一擁有者的原始任務描述
```

## 兩條主線

1. **產品線**：把 Game Log 從可行性研究 → 原型 → 可用的 web app。
2. **領域線**：真正學會雙打對戰知識，讓判讀規則有領域理解支撐。

## Live Docs（對外文件）

`docs-site/` 是一個靜態網站，用白話呈現產品調研、規劃藍圖與進度。本機預覽：

```bash
cd docs-site && python3 -m http.server 8765
# 開 http://localhost:8765
```

可直接部署到 GitHub Pages / 任何靜態主機。

## 自動化

Ditto 透過 cron 定期推進研究、反思、整理文件。排程與行為定義見 [`scripts/CRON.md`](scripts/CRON.md)。

## 工作原則

- 先查證再斷言（技術與對戰知識都要有來源或實測）。
- 小步前進、每段落 commit & push。
- 公開、白話地寫文件。
- 會反思、會進化。
