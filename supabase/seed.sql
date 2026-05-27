-- Seed the menu with the 8 launch juices. Colors match the spin wheel palette so
-- both the web app and the mobile app render correctly out of the box.
insert into public.drinks (name, description, ingredients, price_cents, credit_cost, color_hex, text_color_hex, tag, display_order, image_url) values
('Strawberry Bliss', 'Sweet and creamy, perfect any time of day', ARRAY['Strawberry', 'Banana', 'Almond milk', 'Honey'], 800, 1, '#ED93B1', '#4B1528', 'Fresh today', 1, '/assets/strawberry.png'),
('Sunrise Mango', 'Tropical kickstart with anti-inflammatory turmeric', ARRAY['Mango', 'Pineapple', 'Ginger', 'Turmeric'], 900, 1, '#EF9F27', '#412402', 'Energy boost', 2, '/assets/mango.png'),
('Kiwi Crush', 'Greens forward but actually delicious', ARRAY['Kiwi', 'Spinach', 'Apple', 'Lime'], 850, 1, '#97C459', '#173404', 'Greens forward', 3, '/assets/green.png'),
('Berry Forest', 'Antioxidant powerhouse with deep berry notes', ARRAY['Blueberry', 'Blackberry', 'Acai', 'Fresh mint'], 950, 1, '#AFA9EC', '#26215C', 'Antioxidant', 4, '/assets/blueberry.png'),
('Watermelon Wave', 'Hydration with a savory twist', ARRAY['Watermelon', 'Basil', 'Lime', 'Sea salt'], 750, 1, '#F0997B', '#4A1B0C', 'Hydration', 5, '/assets/watermelon.png'),
('Apple Mint Reset', 'Clean greens for a fresh start', ARRAY['Green apple', 'Cucumber', 'Mint', 'Celery'], 800, 1, '#5DCAA5', '#04342C', 'Clean start', 6, '/assets/apple.png'),
('Pineapple Glow', 'Immunity blend with a kick of ginger', ARRAY['Pineapple', 'Carrot', 'Ginger', 'Lemon'], 850, 1, '#FAC775', '#412402', 'Immunity', 7, '/assets/pineapple.png'),
('Acai Power', 'Premium bowl style with raw honey and crunch', ARRAY['Acai', 'Banana', 'Granola', 'Raw honey'], 1000, 2, '#534AB7', '#EEEDFE', 'Premium', 8, '/assets/acai.png');
