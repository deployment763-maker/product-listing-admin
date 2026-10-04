-- Development seed only. Do not run against production.
-- Uses public Unsplash placeholders so the catalogue works before original photos are uploaded.

insert into public.paintings (
  id, title, slug, description, price, framed_price, currency, medium,
  width, height, size_label, is_framed, status, featured
) values
(
  '11111111-1111-4111-8111-111111111111',
  'Monsoon',
  'monsoon',
  'Rain-soaked greens and pewter skies, painted after a long evening watching the storm settle over the trees. Layers of acrylic wash and dry brush give the surface a wet, breathing quality.',
  5000, 7500, 'INR', 'Acrylic',
  297, 420, 'A3', false, 'AVAILABLE', true
),
(
  '22222222-2222-4222-8222-222222222222',
  'Serenity',
  'serenity',
  'A quiet field of warm greys and pale gold. The composition is spare on purpose — a place for the eye to rest.',
  7500, 10500, 'INR', 'Acrylic',
  420, 594, 'A2', false, 'AVAILABLE', true
),
(
  '33333333-3333-4333-8333-333333333333',
  'Golden Hour',
  'golden-hour',
  'Late light across water, held in translucent watercolor. This piece has found a home.',
  6000, 8500, 'INR', 'Watercolor',
  297, 420, 'A3', true, 'SOLD', false
),
(
  '44444444-4444-4444-8444-444444444444',
  'Temple Bells',
  'temple-bells',
  'Small study in deep vermillion and soot. Suggested by the hush just after evening aarti.',
  4500, 6500, 'INR', 'Acrylic',
  210, 297, 'A4', false, 'AVAILABLE', false
),
(
  '55555555-5555-4555-8555-555555555555',
  'Quiet Garden',
  'quiet-garden',
  'Leaves, shade, and a little wildness. Watercolor on heavy paper, with a few ink notes in the undergrowth.',
  8000, 11000, 'INR', 'Watercolor',
  420, 594, 'A2', false, 'AVAILABLE', true
),
(
  '66666666-6666-4666-8666-666666666666',
  'River Light',
  'river-light',
  'A mixed-media riverbank: acrylic body, watercolor sky, and a thin gold line where the water turns.',
  5500, 8000, 'INR', 'Mixed media',
  297, 420, 'A3', false, 'AVAILABLE', false
)
on conflict (id) do nothing;

insert into public.painting_images (painting_id, image_url, storage_path, sort_order, is_preview) values
(
  '11111111-1111-4111-8111-111111111111',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1600&q=80',
  null, 0, false
),
(
  '11111111-1111-4111-8111-111111111111',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80',
  null, 1, true
),
(
  '22222222-2222-4222-8222-222222222222',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1600&q=80',
  null, 0, false
),
(
  '33333333-3333-4333-8333-333333333333',
  'https://images.unsplash.com/photo-1577083552431-6e5fd01984ec?auto=format&fit=crop&w=1600&q=80',
  null, 0, false
),
(
  '44444444-4444-4444-8444-444444444444',
  'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1600&q=80',
  null, 0, false
),
(
  '55555555-5555-4555-8555-555555555555',
  'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=1600&q=80',
  null, 0, false
),
(
  '55555555-5555-4555-8555-555555555555',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
  null, 1, true
),
(
  '66666666-6666-4666-8666-666666666666',
  'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=1600&q=80',
  null, 0, false
)
;
