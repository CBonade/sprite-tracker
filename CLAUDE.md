# Sprite Tracker

Mobile-first web app for tracking a Fortnite sprite collection. Two users (owner + one friend) can each track their own collection and view each other's in read-only mode.

## Stack

- **Frontend**: React + Vite 7 + Tailwind CSS, deployed to Vercel (auto-deploy on push to main)
- **Backend**: Supabase (Postgres + Auth + RLS) — project ID `bbfnwswogaesrpifuoht`
- **Auth**: Google OAuth, implicit flow (`flowType: 'implicit'` in `src/lib/supabase.js`)
- **Repo**: github.com/CBonade/sprite-tracker (public, single owner — commit directly to main, no branches/PRs)

## Data model

**`sprites`** table: `base_name`, `variant` (`base`/`gold`/`gummy`/`galaxy`/`holofoil`/`null` for one-offs), `full_name`, `rarity` (`rare`/`epic`/`legendary`/`mythic`/`special`), `is_starter`, `sort_order`, `image_url` (nullable — see "Sprite artwork" below)

The variant list is expected to keep growing as the game introduces new cosmetic tiers (e.g. `holofoil` was added 2026-07-09) — it is not a fixed enum. Non-base variants (`gold`/`gummy`/`galaxy`/`holofoil`/…) always carry `rarity: "special"` and `is_starter: false`, matching the existing rows for that base_name regardless of the base variant's own `is_starter`. Adding a new variant tier requires a schema change first — see "Schema changes" below — then the same upsert flow as any other sprite.

**`user_collections`** table: `user_id`, `sprite_id`, `status` (`acquired`/`mastered`). RLS allows a follower to read the followed user's rows.

**`follows`** table: one-way. `follower_id` → `following_id`.

**`profiles`** table: `id` (= auth.users.id), `display_name`.

Status cycle on tap: `null → acquired → mastered → null`.

One-off sprites (e.g. Burnt Peanut) have `variant = null` and display as a single `●` button.

## Key files

- `src/lib/supabase.js` — Supabase client
- `src/contexts/AuthContext.jsx` — session, profile, loading state
- `src/components/SpriteGroup.jsx` — renders one sprite group (all variants) as tappable tiles; image-based when `image_url` is set (see "Sprite artwork"), falls back to a colored block + label otherwise
- `src/components/CollectionView.jsx` — filter/sort bar + full list; handles optimistic updates and DB writes
- `src/pages/Friends.jsx` — follow search and following list
- `src/pages/FriendView.jsx` — read-only collection view for a followed user
- `supabase/migrations/001_initial.sql` — full schema (follows table MUST be defined before user_collections RLS)
- `supabase/seed.sql` — initial 61 sprites
- `scripts/upsert-sprites.js` — Thursday drop ingestion script
- `poc.html` / `src/poc-main.jsx` — standalone dev-only preview harness for `SpriteGroup` with mocked props (no Supabase, no auth). Not part of the production build (Vite only bundles the default `index.html` entry). Use it to visually check new sprite artwork/crown placement before wiring images into the DB — the live `sprites` table requires an authenticated session to read (RLS), so testing through the real app needs a logged-in session.

## Environment

`.env` (gitignored) must contain:
```
VITE_SUPABASE_URL=https://bbfnwswogaesrpifuoht.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

`VITE_` vars are baked into the client bundle at build time — Vercel env var changes require a redeploy. `SUPABASE_SERVICE_ROLE_KEY` is server-only (used by the upsert script, never bundled).

## Schema changes

This project has no linked Supabase CLI project directory and no `psql` connection string on file — schema changes (e.g. adding a new sprite variant tier) go through the Supabase Management API instead of the SQL editor:

1. Get a Supabase personal access token (dashboard → Account → Access Tokens) if the cached one has expired, and store it: `security add-generic-password -s "cc/personal/supabase/bbfnwswogaesrpifuoht-pat" -a "cc" -w "<token>" -U`
2. `export SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s "cc/personal/supabase/bbfnwswogaesrpifuoht-pat" -a "cc" -w)`
3. `npx --yes supabase link --project-ref bbfnwswogaesrpifuoht`
4. `npx --yes supabase db query --linked "<SQL>"` — runs arbitrary SQL against the live DB via the Management API, no DB password needed

This project shares its Supabase project (`bbfnwswogaesrpifuoht`) with droid-tycoon, so the same token/steps work for schema changes there too.

## Deployment

Push to main → Vercel builds and deploys automatically. No manual deploy step needed. Sprite data changes (via upsert script) are live immediately without a redeploy.

**Commit per feature as usual, but do not push after every commit.** Vercel's free tier caps monthly deploys, and this project (and droid-tycoon, on the same plan) blew through that cap in under 2 days when every commit auto-deployed. Batch commits locally and push only once a full round of work is ready to ship, then push everything together in one go (multiple commits in that push is fine — each commit should still represent one feature/fix, per normal commit hygiene).

## Thursday drop workflow

When new sprites drop, the user shares a screenshot. Parse it into the JSON format below and run the upsert script. `sort_order` is optional — the script auto-assigns from `max(sort_order) + 1`.

```bash
node --env-file=.env scripts/upsert-sprites.js '[
  { "base_name": "Aura", "variant": "base",   "full_name": "Aura Sprite",        "rarity": "epic",      "is_starter": false },
  { "base_name": "Aura", "variant": "gold",   "full_name": "Gold Aura Sprite",   "rarity": "special",   "is_starter": false },
  { "base_name": "Aura", "variant": "gummy",  "full_name": "Gummy Aura Sprite",  "rarity": "special",   "is_starter": false },
  { "base_name": "Aura", "variant": "galaxy", "full_name": "Galaxy Aura Sprite", "rarity": "special",   "is_starter": false }
]'
```

For one-off sprites: `"variant": null`, `full_name` is just the sprite's name.

Gold/gummy/galaxy variants are always `rarity: "special"`. The base variant carries the actual rarity.

## Sprite artwork

Each sprite **variant** needs its own image — one per `sprites` row, not one per base name (gold/gummy/galaxy each look visually distinct, they're not just a filtered/recolored base image). At 61 seeded rows that's up to ~61 images, growing weekly as new sprites drop.

**Sourcing**: images are collected manually by the user (screenshots/saves), not scraped. Sites that have hosted this artwork (e.g. IGN, Polygon) explicitly disallow AI/automated scraping in `robots.txt` (they block `anthropic-ai`, `ClaudeBot`, etc. outright) and prohibit it in their terms of use — don't attempt to fetch or bulk-download sprite images from third-party sites even if a request succeeds technically.

**Format**: `src/assets/{variant}_{base_name_lowercase}_sprite.webp` (e.g. `gold_water_sprite.webp`), matching the existing decorative assets already in that folder. Verify real alpha transparency before use — `sips -g hasAlpha <file>` should report `yes`, and the alpha channel should have genuine variance (`min != max`), not just a flattened white/dark background that happens to carry an alpha flag. If a source image has a flattened solid background instead, chroma-key removal (Pillow, distance-from-background-color with a smooth edge falloff) works well for flat/solid backgrounds; soft gradients or glow edges need a wider low/high distance threshold or per-image tuning.

**Rendering** (`SpriteGroup.jsx`): a sprite tile shows its `image_url` at `opacity-35` when not owned, `opacity-100` when acquired or mastered. When mastered, `crown_mastered.png` renders as a small **fixed-size corner badge** (`-top-1.5 -right-1.5 w-4`) — not scaled or positioned to match each sprite's actual head geometry. That was tried and rejected: at a 40×36px tile, `object-cover` on a full-body 512×512 source image renders the head as only ~18% of the tile's width, so a geometrically-accurate crown is too small to read. A fixed badge in the corner reads consistently regardless of any individual sprite's pose/silhouette.

Sprites without `image_url` yet fall back to the original colored block + text label — safe to commit/deploy mid-rollout as images are collected incrementally.

## Releases

Every time a batch is pushed (see the push-batching note under "Deployment" above), tag a release and publish notes — this is routine, not something that waits for the user to ask. Use semantic versioning: bump minor for new features, patch for fixes/docs-only batches. Generate notes as a short bullet list from the commits since the last tag (`git log <last-tag>..HEAD --oneline`), grouped by feature/fix, not a raw commit dump.

```bash
git tag v1.2.0
git push origin v1.2.0
gh release create v1.2.0 --title "v1.2.0" --notes "..."
```

No in-app release-notes display yet — that's deferred to a future iteration. For now this is purely the tag + GitHub release.

Write release notes as a short bullet list of what's in the release. Current version in progress: **v1.1.1**.
