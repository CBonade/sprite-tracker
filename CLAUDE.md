# Sprite Tracker

Mobile-first web app for tracking a Fortnite sprite collection. Two users (owner + one friend) can each track their own collection and view each other's in read-only mode.

## Stack

- **Frontend**: React + Vite 7 + Tailwind CSS, deployed to Netlify (auto-deploy on push to main)
- **Backend**: Supabase (Postgres + Auth + RLS) — project ID `bbfnwswogaesrpifuoht`
- **Auth**: Google OAuth, implicit flow (`flowType: 'implicit'` in `src/lib/supabase.js`)
- **Repo**: github.com/CBonade/sprite-tracker (public, single owner — commit directly to main, no branches/PRs)

## Data model

**`sprites`** table: `base_name`, `variant` (`base`/`gold`/`gummy`/`galaxy`/`null` for one-offs), `full_name`, `rarity` (`rare`/`epic`/`legendary`/`mythic`/`special`), `is_starter`, `sort_order`

**`user_collections`** table: `user_id`, `sprite_id`, `status` (`acquired`/`mastered`). RLS allows a follower to read the followed user's rows.

**`follows`** table: one-way. `follower_id` → `following_id`.

**`profiles`** table: `id` (= auth.users.id), `display_name`.

Status cycle on tap: `null → acquired → mastered → null`.

One-off sprites (e.g. Burnt Peanut) have `variant = null` and display as a single `●` button.

## Key files

- `src/lib/supabase.js` — Supabase client
- `src/contexts/AuthContext.jsx` — session, profile, loading state
- `src/components/SpriteGroup.jsx` — renders one sprite group (all variants)
- `src/components/CollectionView.jsx` — filter/sort bar + full list; handles optimistic updates and DB writes
- `src/pages/Friends.jsx` — follow search and following list
- `src/pages/FriendView.jsx` — read-only collection view for a followed user
- `supabase/migrations/001_initial.sql` — full schema (follows table MUST be defined before user_collections RLS)
- `supabase/seed.sql` — initial 61 sprites
- `scripts/upsert-sprites.js` — Thursday drop ingestion script

## Environment

`.env` (gitignored) must contain:
```
VITE_SUPABASE_URL=https://bbfnwswogaesrpifuoht.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

`VITE_` vars are baked into the client bundle at build time — Netlify env var changes require a redeploy. `SUPABASE_SERVICE_ROLE_KEY` is server-only (used by the upsert script, never bundled).

## Deployment

Push to main → Netlify builds and deploys automatically. No manual deploy step needed. Sprite data changes (via upsert script) are live immediately without a redeploy.

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

## Releases

Tag and release on GitHub when the user asks. Use semantic versioning. Create the tag and release via `gh`:

```bash
git tag v1.0.0
git push origin v1.0.0
gh release create v1.0.0 --title "v1.0.0" --notes "..."
```

Write release notes as a short bullet list of what's in the release. Current version in progress: **v1.0.0**.
