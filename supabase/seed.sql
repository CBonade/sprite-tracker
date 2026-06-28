insert into public.sprites (base_name, variant, full_name, rarity, is_starter, sort_order)
values
  -- Water
  ('Water', 'base',   'Water Sprite',        'rare',      true,  1),
  ('Water', 'gold',   'Gold Water Sprite',   'special',   false, 2),
  ('Water', 'gummy',  'Gummy Water Sprite',  'special',   false, 3),
  ('Water', 'galaxy', 'Galaxy Water Sprite', 'special',   false, 4),
  -- Earth
  ('Earth', 'base',   'Earth Sprite',        'rare',      true,  5),
  ('Earth', 'gold',   'Gold Earth Sprite',   'special',   false, 6),
  ('Earth', 'gummy',  'Gummy Earth Sprite',  'special',   false, 7),
  ('Earth', 'galaxy', 'Galaxy Earth Sprite', 'special',   false, 8),
  -- Fire
  ('Fire',  'base',   'Fire Sprite',         'rare',      true,  9),
  ('Fire',  'gold',   'Gold Fire Sprite',    'special',   false, 10),
  ('Fire',  'gummy',  'Gummy Fire Sprite',   'special',   false, 11),
  ('Fire',  'galaxy', 'Galaxy Fire Sprite',  'special',   false, 12),
  -- Duck
  ('Duck',  'base',   'Duck Sprite',         'epic',      false, 13),
  ('Duck',  'gold',   'Gold Duck Sprite',    'special',   false, 14),
  ('Duck',  'gummy',  'Gummy Duck Sprite',   'special',   false, 15),
  ('Duck',  'galaxy', 'Galaxy Duck Sprite',  'special',   false, 16),
  -- Ghost
  ('Ghost', 'base',   'Ghost Sprite',        'epic',      false, 17),
  ('Ghost', 'gold',   'Gold Ghost Sprite',   'special',   false, 18),
  ('Ghost', 'gummy',  'Gummy Ghost Sprite',  'special',   false, 19),
  ('Ghost', 'galaxy', 'Galaxy Ghost Sprite', 'special',   false, 20),
  -- Dream
  ('Dream', 'base',   'Dream Sprite',        'legendary', false, 21),
  ('Dream', 'gold',   'Gold Dream Sprite',   'special',   false, 22),
  ('Dream', 'gummy',  'Gummy Dream Sprite',  'special',   false, 23),
  ('Dream', 'galaxy', 'Galaxy Dream Sprite', 'special',   false, 24),
  -- Demon
  ('Demon', 'base',   'Demon Sprite',        'epic',      false, 25),
  ('Demon', 'gold',   'Gold Demon Sprite',   'special',   false, 26),
  ('Demon', 'gummy',  'Gummy Demon Sprite',  'special',   false, 27),
  ('Demon', 'galaxy', 'Galaxy Demon Sprite', 'special',   false, 28),
  -- Punk
  ('Punk',  'base',   'Punk Sprite',         'legendary', false, 29),
  ('Punk',  'gold',   'Gold Punk Sprite',    'special',   false, 30),
  ('Punk',  'gummy',  'Gummy Punk Sprite',   'special',   false, 31),
  ('Punk',  'galaxy', 'Galaxy Punk Sprite',  'special',   false, 32),
  -- King
  ('King',  'base',   'King Sprite',         'epic',      false, 33),
  ('King',  'gold',   'Gold King Sprite',    'special',   false, 34),
  ('King',  'gummy',  'Gummy King Sprite',   'special',   false, 35),
  ('King',  'galaxy', 'Galaxy King Sprite',  'special',   false, 36),
  -- Burnt Peanut (standalone, no variants)
  ('Burnt Peanut', null, 'Burnt Peanut',     'mythic',    false, 37),
  -- Zero Point
  ('Zero Point', 'base',   'Zero Point Sprite',        'mythic',  false, 38),
  ('Zero Point', 'gold',   'Gold Zero Point Sprite',   'special', false, 39),
  ('Zero Point', 'gummy',  'Gummy Zero Point Sprite',  'special', false, 40),
  ('Zero Point', 'galaxy', 'Galaxy Zero Point Sprite', 'special', false, 41),
  -- Fishy
  ('Fishy', 'base',   'Fishy Sprite',        'rare',    false, 42),
  ('Fishy', 'gold',   'Gold Fishy Sprite',   'special', false, 43),
  ('Fishy', 'gummy',  'Gummy Fishy Sprite',  'special', false, 44),
  ('Fishy', 'galaxy', 'Galaxy Fishy Sprite', 'special', false, 45),
  -- Striker
  ('Striker', 'base',   'Striker Sprite',        'epic',    false, 46),
  ('Striker', 'gold',   'Gold Striker Sprite',   'special', false, 47),
  ('Striker', 'gummy',  'Gummy Striker Sprite',  'special', false, 48),
  ('Striker', 'galaxy', 'Galaxy Striker Sprite', 'special', false, 49),
  -- Aura
  ('Aura', 'base',   'Aura Sprite',        'epic',    false, 50),
  ('Aura', 'gold',   'Gold Aura Sprite',   'special', false, 51),
  ('Aura', 'gummy',  'Gummy Aura Sprite',  'special', false, 52),
  ('Aura', 'galaxy', 'Galaxy Aura Sprite', 'special', false, 53),
  -- Boss
  ('Boss', 'base',   'Boss Sprite',        'legendary', false, 54),
  ('Boss', 'gold',   'Gold Boss Sprite',   'special',   false, 55),
  ('Boss', 'gummy',  'Gummy Boss Sprite',  'special',   false, 56),
  ('Boss', 'galaxy', 'Galaxy Boss Sprite', 'special',   false, 57),
  -- Grim
  ('Grim', 'base',   'Grim Sprite',        'mythic',  false, 58),
  ('Grim', 'gold',   'Gold Grim Sprite',   'special', false, 59),
  ('Grim', 'gummy',  'Gummy Grim Sprite',  'special', false, 60),
  ('Grim', 'galaxy', 'Galaxy Grim Sprite', 'special', false, 61)
on conflict (full_name) do update set
  rarity     = excluded.rarity,
  is_starter = excluded.is_starter,
  sort_order = excluded.sort_order;
