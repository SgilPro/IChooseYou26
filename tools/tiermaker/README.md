# TierMaker 特性卡

把 Pokémon Champions 現行規則裡所有合法寶可夢會用到的特性，做成 1:1 的名稱圖（中文＋英文），供 TierMaker 上傳。特性說明另外輸出成文字檔。

## 產出位置（不進版控）

```
exports/tiermaker/abilities-m-c/
├── images/              215 張 600×600 PNG，檔名是英文特性名（intimidate.png、dry-skin.png）
├── cover.png            模板封面 1200×1200（cover-wide.png 是 1200×630 橫式備用）
├── abilities-m-c.csv    中英名稱、中英說明、是否超級進化專用、擁有此特性的寶可夢（Excel 可直接開）
└── abilities-m-c.md     同上，方便閱讀的版本
```

## 怎麼重做（例如換到下一個規則）

```bash
tools/tiermaker/fetch.sh                                              # 下載來源到 .cache/tiermaker/
node tools/tiermaker/legal.cjs .cache/tiermaker .cache/tiermaker/legal.json
python3 -I tools/tiermaker/build.py .cache/tiermaker exports/tiermaker/abilities-m-c M-C
python3 -I tools/tiermaker/render.py .cache/tiermaker/abilities.json exports/tiermaker/abilities-m-c/images
python3 -I tools/tiermaker/cover.py exports/tiermaker/abilities-m-c M-C 215   # 封面（要先有 images/）
```

封面放在 `images/` 外面，上傳項目時全選 `images/` 就不會把封面當成一個特性。封面上的五張卡（威嚇、惡作劇之心、日照、再生力、黃金之軀）寫在 `cover.py` 的 `FAN`。

- `render.py` 第三個參數可改邊長（預設 600），後面可接英文名只重做幾張。
- 需要 Google Chrome（截圖用）與 `app/node_modules/typescript`（解析 Showdown 資料用）。
- 換規則時，把匯出資料夾名稱與規則代碼一起改（例如 `abilities-m-d`、`M-D`）。前提是 Showdown 的 `champions` mod 已切到新規則。

## 資料來源

| 用途 | 來源 | 備註 |
|---|---|---|
| 現行規則的合法名單 | Showdown `data/mods/champions/formats-data.ts` | 沒有 `isNonstandard`、tier 不是 `Illegal` 的就是合法 |
| 各寶可夢有哪些特性 | Showdown `data/pokedex.ts` | |
| 遊戲內中英文名稱與說明 | [projectpokemon/champout](https://github.com/projectpokemon/champout) `rom-txt/{tch,usa}/tokusei*.json` | 從遊戲拆出的文字，跟著遊戲版本更新 |
| 交叉核對 | champout `masterdata/personal.json` | 遊戲內所有寶可夢實際擁有的特性；和 Showdown 名單不一致時 `build.py` 會中止 |

- Showdown 列了、遊戲裡沒有的特性會排除（M-C 時是甲賀忍蛙的 Battle Bond）。
- 下載的檔案只被解析，不被執行：`legal.cjs` 用 TypeScript 編譯器讀語法樹取字面值。
- 名稱與說明是遊戲官方文字，著作權屬於 The Pokémon Company 等權利人，所以產出放在 `exports/`，不推上公開 repo。
- 寶可夢型態的中文（例如「阿羅拉」「刀劍形態」）是 `build.py` 裡的簡短標記，不一定是遊戲內的正式寫法。
