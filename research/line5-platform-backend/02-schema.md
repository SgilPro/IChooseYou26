# 關聯式 Schema（Postgres / Supabase）草稿

> 2026-11-08 · Ditto。原則：**`data/schema/*.json` 是契約**，DB 只是另一種放法；每個 JSON 欄位都要找得到落點。

## 一、ER 概觀（白話）
- 一個**遊戲**（Champions / SV）有多個**規則組**。
- 一支**影片**屬於一個**頻道**，可能介紹 0~N 支**隊伍**。
- 一支**隊伍**屬於一個規則組、一位**作者**、有 0~6 個**成員**、0~N 個**標籤**。
- 一個成員指向一個**圖鑑物種**（class），本身是配置（instance）：道具/特性/性格/努力值/招式。
- **筆記**可以掛在隊伍、影片、物種或規則組上（Notion 自由文字的落點）。
- 隊伍來源三種：第一線自動抽取（`line1`）、Notion 搬入（`notion`）、使用者投稿（`user`）。

## 二、DDL 草稿
```sql
create type game_id as enum ('champions','sv','swsh','other');
create type restriction_type as enum ('無神獸','單神','雙神','幻獸','其他');
create type source_kind as enum ('line1','notion','user');
create type visibility as enum ('public','unlisted','private');
create type review_status as enum ('auto','reviewed','conflict','needs-member-access','manual');
create type field_source as enum ('title','subtitle','frame','description','pinned_comment','inferred','manual');

create table regulation_set (
  id text primary key,                       -- champions-m-c
  game game_id not null,
  code text not null, name text,
  restriction_type restriction_type not null,
  restriction_note text,
  mechanics text[] not null default '{}',    -- mega/tera/dynamax/z-move/none
  starts_on date, ends_on date,
  showdown_format text,                      -- Pikalytics slug 同款
  pokemon_pool_note text, sources text[] default '{}',
  verified boolean not null default false
);

create table pokemon_species (
  id text primary key,                       -- @pkmn/dex id，如 basculegionf
  dex_no int, name_zh text not null, name_en text, form text,
  sprite_url text
);

create table channel (
  id text primary key,                       -- YouTube channel id（UC…），video.schema 的必填欄位；handle 可被改名，不當主鍵
  handle text unique,                        -- @fiskepokemon（team.schema 只存 handle，靠這欄對回）
  name text
);

create table author (
  id uuid primary key default gen_random_uuid(),
  name text not null, channel_handle text references channel(handle),
  url text, unique (name, channel_handle)
);

create table video (
  id text primary key,                       -- YouTube id
  url text not null, channel_id text not null references channel(id),
  title text not null, published_at date, duration_s numeric,
  view_count int, like_count int, availability text,
  is_members_only boolean not null default false,
  tab text[] default '{}', playlists text[] default '{}',
  category text not null, game game_id, regulation_code text,
  chapters jsonb default '[]', team_intro_range jsonb,
  subtitles text[] default '{}', has_auto_captions boolean,
  description text, pinned_comment text, pokepaste_urls text[] default '{}',
  author_id uuid references author(id), author_source text,
  fetched_at timestamptz not null, fetch_error text
);

create table team (
  id text primary key,                       -- team_<videoId>[_n] / notion_<pageId> / usr_<uuid>
  name text not null, name_source text,
  video_id text references video(id), video_url text,  -- Notion 隊伍可能只有網址
  channel_handle text references channel(handle),
  game game_id not null,
  regulation_set_id text references regulation_set(id), regulation_source text,
  author_id uuid references author(id), author_source text,
  is_members_only boolean not null default false,
  related_video_ids text[] default '{}',
  sources jsonb,                             -- subtitle_lang / subtitle_range_s / frames_used / pokepaste_url
  confidence numeric check (confidence between 0 and 1),
  review_status review_status not null default 'auto', review_notes text,
  notes text,
  source_kind source_kind not null default 'line1',
  notion_page_id text unique,
  owner_user_id uuid references auth.users(id),  -- Phase 2/3
  visibility visibility not null default 'public',
  share_code text unique,
  extracted_at timestamptz, extracted_by text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table team_member (
  id bigserial primary key,
  team_id text not null references team(id) on delete cascade,
  slot smallint not null check (slot between 1 and 6),
  species_id text references pokemon_species(id),
  species_name_zh text not null,             -- 對不到圖鑑時仍保留原文
  species_confidence numeric,
  nickname text,
  ability text, ability_en text, ability_conf numeric, ability_src field_source,
  item text, item_en text, item_conf numeric, item_src field_source,
  nature text, nature_en text, nature_conf numeric, nature_src field_source,
  tera_type text, tera_type_en text, tera_type_conf numeric, tera_type_src field_source,  -- JSON 是 field 物件，不是純文字
  mega boolean, gender text check (gender in ('M','F','N')),
  evs_scale text check (evs_scale in ('champions-points-32','ev-252')),  -- 必填！Champions 0–32 點 vs. SV 0–252，混在一起統計會錯
  ev_hp smallint, ev_atk smallint, ev_def smallint, ev_spa smallint, ev_spd smallint, ev_spe smallint,
  evs_conf numeric, evs_src field_source,
  stat_hp smallint, stat_atk smallint, stat_def smallint, stat_spa smallint, stat_spd smallint, stat_spe smallint, stats_src field_source,  -- 實際能力值（影片畫面常直接給）
  stats_note text, role_note text,
  raw jsonb,                                 -- 原 JSON 物件整份保留，不丟資訊
  unique (team_id, slot)
);

create table team_member_move (
  team_member_id bigint references team_member(id) on delete cascade,
  move_order smallint check (move_order between 1 and 4),
  move text not null, move_en text, confidence numeric, source field_source,
  primary key (team_member_id, move_order)
);

create table tag (
  slug text primary key, label_zh text not null, label_en text,
  category text not null, aliases_zh text[] default '{}', description text
);
create table team_tag (
  team_id text references team(id) on delete cascade,
  tag_slug text references tag(slug),
  source text,                               -- title/subtitle/analysis/manual
  primary key (team_id, tag_slug)
);

create table note (
  id uuid primary key default gen_random_uuid(),
  body text not null, owner_user_id uuid references auth.users(id),
  notion_page_id text unique, created_at timestamptz default now()
);
create table note_link (
  note_id uuid references note(id) on delete cascade,
  target_type text check (target_type in ('team','video','species','regulation_set')),
  target_id text not null, primary key (note_id, target_type, target_id)
);

-- 衍生統計（Pikalytics 式）：每規則組每物種的出現率
-- ⚠ 去重：Fiske 的會員影片多是公開影片的延伸，同一支隊伍會以兩個 team.id 出現（互相列在 related_video_ids）。
--   統計前要先挑一支代表（例如 review_status 較高、或 video.published_at 較早的那支），否則使用率與常見隊友會重複計算。
--   下面的 view 先不做去重，Phase 1 的 build-data 腳本要處理；DB 版可加 team.canonical_team_id 欄位後在 where 過濾。
create view v_species_usage as
select t.regulation_set_id, m.species_id,
       count(distinct t.id) as teams_with,
       (select count(*) from team x where x.regulation_set_id = t.regulation_set_id and x.visibility='public') as teams_total,
       round(100.0 * count(distinct t.id) /
         nullif((select count(*) from team x where x.regulation_set_id = t.regulation_set_id and x.visibility='public'),0), 1) as usage_pct
from team t join team_member m on m.team_id = t.id
where t.visibility = 'public'
group by t.regulation_set_id, m.species_id;

-- 常見隊友前五
create view v_species_teammates as
select a.species_id, t.regulation_set_id, b.species_id as teammate, count(*) as n,
       row_number() over (partition by a.species_id, t.regulation_set_id order by count(*) desc) as rk
from team_member a join team_member b on a.team_id=b.team_id and a.species_id<>b.species_id
join team t on t.id=a.team_id where t.visibility='public'
group by a.species_id, t.regulation_set_id, b.species_id;
```

## 三、RLS 範例（Supabase）
```sql
alter table team enable row level security;
alter table team_member enable row level security;

-- 公開隊伍人人可讀；私人/未列出只有本人
create policy team_read on team for select
  using (visibility = 'public' or owner_user_id = auth.uid());
-- unlisted：前端用 share_code 經 security definer 函式取，不開在 policy
create policy team_write on team for insert with check (owner_user_id = auth.uid());
create policy team_update on team for update using (owner_user_id = auth.uid());
create policy team_delete on team for delete using (owner_user_id = auth.uid());

-- 成員隨隊伍
create policy member_read on team_member for select
  using (exists (select 1 from team t where t.id = team_id
                 and (t.visibility='public' or t.owner_user_id = auth.uid())));
-- 參照表：人人可讀，只有 service_role（seed 腳本）可寫
alter table regulation_set enable row level security;
create policy ref_read on regulation_set for select using (true);
```
第一線 / Notion 匯入的隊伍 `owner_user_id` 設為第一擁有者帳號，他就能在網頁上改；Ditto 的 seed 腳本用 service_role key 繞過 RLS（官方文件：service_role「bypasses RLS, so keep it server-side」，且只在請求不帶使用者 token 時才繞過）。參考：<https://supabase.com/docs/guides/database/postgres/row-level-security>

Action Plan 2.3 提到 `profiles.role: owner/editor/viewer`，上面的 policy 只認 `owner_user_id`，editor 會改不了任何東西。補一條：
```sql
create table profiles (id uuid primary key references auth.users(id), role text not null default 'viewer' check (role in ('owner','editor','viewer')));
create policy team_update_editor on team for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','editor')));
```
（`team_member` / `team_member_move` 也要同樣補；只開 update 不開 delete。）

## 四、與 `data/schema/*.json` 對照
| JSON | 表 | 備註 |
|---|---|---|
| `regulation_set.schema.json` | `regulation_set` | 1:1，`mechanics` → `text[]` |
| `tag.schema.json` | `tag` | 1:1 |
| `video.schema.json` | `video` | `chapters`/`team_intro_range` 存 jsonb；`author` 文字 → `author` 表 upsert 後接 id；`channel_id`/`channel_name`/`channel_handle` 三欄收進 `channel` 表（主鍵用 `channel_id`） |
| `team.schema.json` | `team` + `team_tag` | `tags[]` 拆進 `team_tag`（`tags_source` 落到每列 `source`）；`members[]` 拆進 `team_member` |
| `team_member.schema.json` | `team_member` + `team_member_move` | `species.name_en` 經 `@pkmn/dex` 轉 id → `species_id`；每個 `field{value,value_en,confidence,source}`（含 `tera_type`）攤平成 4 欄；`evs.scale` → `evs_scale`（必填，見 DDL 註解）；`stats{}` → `stat_*`；`gender`；`moves[]` 拆表；整個物件另存 `raw` |

已知小差異：`game_id` enum 含 `swsh`，但 `team.schema.json` / `video.schema.json` 的 `game` enum 只有 `champions/sv/other`；DB 比 JSON 寬沒關係，反向（JSON 加值、DB 沒加）才會壞，CI 用同一份 enum 來源生成即可。

## 五、Notion 概念對照
| Notion | Postgres |
|---|---|
| Database | table |
| Page | row（`notion_page_id` 保留原 id） |
| Title / Text / URL / Number / Checkbox / Date | text / text / text / smallint・numeric / boolean / date |
| Select | enum 或參照表（規則組→`regulation_set`） |
| Multi-select（tags） | junction table `team_tag` |
| Relation（一對多） | 外鍵（成員 → 隊伍） |
| Relation（多對多） | junction table |
| Rollup / Formula | SQL view（不存，算出來） |
| Page 內文 | `note` + `note_link` |
