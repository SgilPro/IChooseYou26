# 追蹤標的 / 常設 Watchlist（tracking targets）

> **這份是給排程任務（每週）讀的「要刷新什麼」清單。** 保持精簡、可機器解析：每項都帶 URL/handle 與「該段每週要確認的問題」。內容詳述見 `06-current-landscape.md`。
>
> **資料時效：2026-06-12**。賽季正處 SV → Pokémon Champions 過渡期，watchlist 本身也可能因平台變動而需調整。

---

## A. 平台 / 規則（變動風險最高，**最高優先**）
- **官方公告**：<https://www.pokemon.com/us/pokemon-news>（搜 "Regulation" / "Champions"）
- **Pokémon Champions Regulations（Victory Road）**：<https://victoryroad.pro/champions-regulations/>
- **SV Regulations（Victory Road）**：<https://victoryroad.pro/sv-rules-regulations/>
- **Bulbapedia — 各 Regulation 頁**（例 [Reg M-A](https://bulbapedia.bulbagarden.net/wiki/Regulation_Set_M-A)）
- **每週要問**：(1) 當前 active Regulation 是哪個？〔2026-06-17 起＝**Reg M-B**，接 M-A；同日 Champions 行動版上線、Season M-3〕(2) **M-B 的確切規則 / 合法 Mega 與寶可夢池**為何（待公布）？M-B 約至 2026-09-02。(3) 之後 regs 是否引入 **Terastallization** 等機制？(4) 平台轉換時程（Champions 2027-09-01 強制）有無更新？

## B. 賽果來源（每週刷新賽後資料）
- **RK9.gg（官方賽務、即時 standings/pairings）**：<https://rk9.gg/tournaments>
- **Limitless VGC（有 API，自動化主力）**：<https://limitlessvgc.com/> ／ standings <https://standings.limitlessvgc.com/> ／ API 見 `02-data-sources-and-apis.md`
- **Pikalytics tournaments（Top-cut 隊表 + usage）**：<https://www.pikalytics.com/tournaments>
- **pokedata.ovh（standings 鏡像）**：<https://www.pokedata.ovh/standingsVGC/>
- **Bulbagarden 論壇（每賽事 Results & Top Teams thread）**：<https://bulbagarden.net/forums/>
- **每週要問**：上週有哪些 Regional/IC 結束？冠軍與 Top-cut 隊伍？Limitless/Pikalytics 是否已覆蓋 **Champions** 新格式資料？

## C. 賽程 / 行事曆（季度層級，月度確認）
- **Victory Road 2026 賽季行事曆**：<https://victoryroad.pro/2026-season-calendar/>
- **官方 Worlds 站**：<https://worlds.pokemon.com/en-us>
- **Liquipedia VGC Worlds 2026**：<https://liquipedia.net/pokemon/Pokemon_Championships/Worlds/2026/VGC>
- **關鍵日期（追蹤中）**：NAIC New Orleans 2026-06-12～14（Champions M-A）｜Worlds San Francisco 2026-08-28～30｜Reg M-A 截止 2026-06-17

## D. 構築語料 / team reports
- **VGCPastes Sheet**：<https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/edit> ／ X `@VGCPastes`
- **Victory Road team reports / rental**：<https://victoryroad.pro/>
- **Trainer Hill**：<https://www.trainerhill.com/>（確認對 Champions 格式支援）
- **每週要問**：新賽事後是否有新 Poképaste / 冠軍 team report 可入庫？

## E. 選手（賽後關注 team reveal；handle 引用前點開確認）
- `@WolfeyGlick` — Wolfe Glick（2016 WC，10× Regional）
- `@CybertronVGC` — Aaron Zheng（主播/創作者，多冠）
- Paul Chua（2026 EUIC 冠軍）｜Dylan Salvanera（2026 Las Vegas）｜Cary D'Ortona（2026 Toronto）｜Arsal Puri（2026 Indianapolis）｜Giovanni Cischke（2025 World Champion）
- **每週要問**：上週賽事新出現的冠軍/亮眼選手是誰？是否值得加入清單？

## F. 內容創作者（YouTube / Twitch）
- **WolfeyVGC**：<https://www.youtube.com/c/WolfeyVGC>（教學 + 賽事 vlog + 原創策略）
- **CybertronVGC**：<https://www.youtube.com/@CybertronVGC>（分析、傷害計算、prep）
- **官方賽事直播**：<https://worlds.pokemon.com/en-us> / Twitch `pokemon`
- **每週要問**：有無新的賽事復盤 / meta 分析影片值得團隊看？

## G. X / Twitter 帳號（領先指標，需校驗）
- `@PlayPokemon` — 官方公告（規則/平台/賽程，**最高權威**）
- `@VGCVictoryRoad` — 賽果/行事曆/規則彙整
- `@VGCPastes` — 真實隊伍 Poképaste
- `@WolfeyGlick`、`@CybertronVGC` — tech / meta call（觀點非資料）
- **監控守則**：官方 > 二手；X 的 tech/meta call 當假設，須以 RK9/Limitless 實際賽果交叉驗證（≥2–3 場重現）才寫入知識庫。

---

## 更新頻率建議（cadence）
| 區塊 | 頻率 | 觸發 |
|---|---|---|
| A 平台/規則 | 每週掃一次 + **事件驅動** | 官方公告、Regulation 換期（如 6/17 後接續格式） |
| B 賽果 | **每週**（賽事多時每場後） | Limitless webhook（賽事結束回呼，見 02 號文件） |
| C 行事曆 | 每月 | 新賽季/IC/Worlds 細節釋出 |
| D 語料 | 每週 | 大型賽事後 |
| E 選手 | 每月複查 + 賽後增補 | 新冠軍出現 |
| F 創作者 | 每月 | 新榜單/新頻道 |
| G X 帳號 | 每週掃，謹慎採信 | team reveal 高峰（賽後 1–3 天） |

> **本檔維護鐵律**：所有「現況」改寫時更新頂部「資料時效」日期，並在 `06-current-landscape.md` 同步信心標記。平台仍在 SV→Champions 過渡，**A 區塊每週必查**。
