# 未來功能藍圖

> 最後更新：2026-06-12

Game Log 是我們的第一個功能（把對戰影像變成可復盤紀錄）。但長期目標是成為一個**完整的寶可夢對戰工具站**。這頁說明 Game Log 之後我們可能會做什麼，以及這些想法從哪來。

## 我們怎麼決定要做什麼

我們不憑空想功能。做法是**拆解現有的優質工具**——看大家已經在用什麼、哪些需求被滿足、哪些還沒——再結合我們在「對戰復盤」上的獨特強項，排出優先順序。我們逐一分析了第一擁有者提供的 12 個參考工具（清單在本頁最後）。

## 我們發現的最大機會

1. **「逐回合復盤」幾乎是空白市場。** 我們分析的 12 個工具，**沒有一個**把「把一場對戰拆成可逐回合檢視的事件紀錄」當成核心功能。我們的 Game Log 剛好坐在這個缺口上——這是天然的護城河。
2. **沒有人把「復盤 → 行動」串起來。** 每個工具各強一塊（使用率、建隊、屬性剋制、賽果），玩家得自己開 5 個分頁手動拼湊。沒有一個能做到「看完這場 → 對手常見配置是這樣 → 你應該這樣選 → 傷害是這樣」的完整流程。
3. **沒有繁體中文的 all-in-one 站。** 繁中圈目前只有計算機與模擬器，缺少「使用率 / meta + 賽果 + 復盤」整合中心。這是地利。
4. **個人化很弱。** 幾乎沒有工具會累積「你個人」的對戰、找出你重複犯的錯。

## 分階段藍圖（初步、會調整）

### Phase 1 — 最便宜、最獨特：在時間軸上疊合「當下情境的傷害」
- 在我們已經抽出的每個攻擊事件上，用官方傷害公式（`@smogon/calc`）即時算出傷害範圍。
- 這把「靜態傷害計算機」升級成「**這場、這個情境下的傷害**」——現有工具沒人做。
- 加上每場自動產生的「戰報摘要卡」（不需任何外部資料）。

### Phase 2 — meta 疊加 + 選用建議
- 顯示對手每隻寶可夢的**常見配置 / 努力值 / 常見隊友**（資料來自 Smogon 使用率，經 `data.pkmn.cc`），並標出「非主流」的特殊 build。
- 結合使用率與屬性剋制邏輯，做**上場選用 / 剋制建議**。

### Phase 3 — 偵察、個人成長、賽事趨勢
- **對手偵察檔**：累積某對手的對戰樣貌。
- **個人「我的弱點」報告**：從你的歷史復盤找出重複犯的錯。
- **賽事與趨勢**：接 [Limitless VGC API](https://limitlessvgc.com/)（含 webhook）追蹤賽果與 meta 變化。

> 三個階段都**重用我們已盤點好的資料來源**（Limitless API、Smogon 使用率、`@smogon/calc`），不需要太多新基礎建設。原則沿用：Showdown 天梯使用率 ≠ 官方賽事 meta，兩者要交叉標注。

## 我們研究的參考工具

**繁體中文**：[bokevon](http://bokevon.web.fc2.com/)、[Victor Poke Champions](https://victorpoke-champions.com/zh-TW)、[poke champion (fable)](https://fable165469.github.io/poke_champion_final.html)

**英文**：Victory Road、[pokedata.ovh](https://pokedata.ovh/)、[pkmn.help](https://www.pkmn.help/defense/solo/)、[Marriland Team Builder](https://marriland.com/tools/team-builder/en/)、[Pokémon Showdown Teambuilder](https://play.pokemonshowdown.com/teambuilder)、[Pikalytics](https://pikalytics.com/)、[Serebii Pokédex](https://serebii.net/pokedex-champions/)、[Labmaus](https://labmaus.net/)

---

*完整拆解、功能矩陣與缺口分析見 repo 的 `research/line3-competitor-tools/`。*
