# 屬性資源（18 種）

- `colors.json`：18 屬性的 id（同 @pkmn/dex）、繁/簡中名、色碼、icon 路徑。色碼取自 https://wiki.52poke.com/wiki/水（属性） 頁面內嵌 CSS（2026-11-09）；色碼只是數值，不含 52poke 的圖片。
- `icons/symbol/<id>.png`：小圖示（朱紫版）。
- `icons/name/<id>.png`：含屬性名稱的標籤圖（朱紫版，名稱為英文，如 WATER，無中文版）。

## 來源與授權狀態

- icon 來源：PokeAPI sprites（https://github.com/PokeAPI/sprites ，`sprites/types/generation-ix/scarlet-violet/`，2026-11-09 下載），與 `assets/items/` 同源。
- sprites repo 沒有明確授權（GitHub 顯示 NOASSERTION）。PokeAPI 說明主要為教育用途，並註明寶可夢相關圖像為 Nintendo 的商標；著作權屬 Nintendo / Creatures / GAME FREAK / The Pokémon Company。
- PokeAPI 要求本機快取，網站不要在執行期請求 PokeAPI。
- 網站公開前要加「非官方粉絲網站」聲明，並再評估是否換成自製圖示。
