-- update-drink-images.sql
-- Run this in the Supabase SQL editor (or `supabase db execute --file update-drink-images.sql`)
-- to wire up the bottle photos that live in public/assets/.
--
-- Paths match the actual files in public/assets/ (NOT the gtw-juice-NN-* convention):
--   strawberry.png  mango.png  green.png  blueberry.png
--   watermelon.png  apple.png  pineapple.png  acai.png
--
-- Safe to re-run: each statement targets a fixed display_order, so re-running
-- after renaming files just overwrites the same 8 rows. No duplicates, no orphans.

UPDATE public.drinks SET image_url = '/assets/strawberry.png' WHERE display_order = 1; -- Strawberry Bliss
UPDATE public.drinks SET image_url = '/assets/mango.png'      WHERE display_order = 2; -- Sunrise Mango
UPDATE public.drinks SET image_url = '/assets/green.png'      WHERE display_order = 3; -- Kiwi Crush
UPDATE public.drinks SET image_url = '/assets/blueberry.png'  WHERE display_order = 4; -- Berry Forest
UPDATE public.drinks SET image_url = '/assets/watermelon.png' WHERE display_order = 5; -- Watermelon Wave
UPDATE public.drinks SET image_url = '/assets/apple.png'      WHERE display_order = 6; -- Apple Mint Reset
UPDATE public.drinks SET image_url = '/assets/pineapple.png'  WHERE display_order = 7; -- Pineapple Glow
UPDATE public.drinks SET image_url = '/assets/acai.png'       WHERE display_order = 8; -- Acai Power

-- Verify it worked:
-- SELECT display_order, name, image_url FROM public.drinks ORDER BY display_order;
