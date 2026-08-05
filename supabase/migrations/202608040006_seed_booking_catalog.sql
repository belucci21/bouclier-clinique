begin;

insert into public.profiles (id, full_name, role)
values ('d0000000-0000-4000-8000-000000000001', 'Dra. Gissel Castellanos', 'doctor')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, updated_at = now();

insert into public.doctors (id, profile_id, specialty, is_active)
values ('d0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Dermatología, medicina estética y láser', true)
on conflict (id) do update set profile_id = excluded.profile_id, specialty = excluded.specialty, is_active = true, updated_at = now();

insert into public.appointment_types (
  id, slug, name, description, duration_minutes, price, price_mxn_minor, color, is_active
) values
  ('a0000000-0000-4000-8000-000000000001', 'laser-duoglide-exion-micropuncion', 'Láser Duoglide/Exion Micropunción', 'Control inteligente de energía para remodelar colágeno, textura, cicatrices y manchas.', 60, null, null, '#111111', true),
  ('a0000000-0000-4000-8000-000000000002', 'hydrafacial', 'Hydrafacial', 'Hidratación profunda, limpieza y renovación en un protocolo de cuatro pasos.', 60, 1800, 180000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000003', 'laser-duoglide', 'Láser Duoglide', 'Tecnología CO₂ + 1540 nm para estimular tejido con precisión y recuperación controlada.', 60, null, null, '#111111', true),
  ('a0000000-0000-4000-8000-000000000004', 'depilacion-laser', 'Depilación Láser', 'Reducción progresiva de vello con plataformas médicas adaptables al fototipo y calibre.', 60, null, null, '#111111', true),
  ('a0000000-0000-4000-8000-000000000005', 'accent-prime', 'Accent Prime', 'Remodela, reafirma y mejora la textura de la piel con un protocolo corporal no invasivo.', 75, 4870, 487000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000006', 'endermologie', 'Endermologie', 'Estimulación mecánica no invasiva para tonificar, alisar y mejorar la calidad de la piel.', 60, null, null, '#111111', true),
  ('a0000000-0000-4000-8000-000000000007', 'hollywood-peel', 'Hollywood Peel', 'Peeling de carbón y láser Q-Switch para luminosidad, poros, textura y tono.', 60, 2250, 225000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000008', 'liftage', 'Liftage', 'Ultrasonido focalizado de alta frecuencia para remodelar tejido en profundidad.', 60, null, null, '#111111', true),
  ('a0000000-0000-4000-8000-000000000009', 'red-touch', 'Red Touch', 'Estimula colágeno y acompaña protocolos de melasma, acné, rosácea y rejuvenecimiento.', 60, 2000, 200000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000010', 'natura-peel', 'Natura Peel', 'Renueva, suaviza y mejora poros, textura, manchas y líneas finas.', 60, 3800, 380000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000011', 'masaje-piedras-calientes', 'Masaje Piedras Calientes', 'Piedras volcánicas y masaje relajante para aliviar tensión y favorecer descanso.', 75, 2080, 208000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000012', 'masaje-relajante', 'Masaje Relajante', 'Trabajo manual de ritmo suave para favorecer circulación, flexibilidad y descanso.', 60, 1510, 151000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000013', 'masaje-deep-tissue', 'Masaje Deep Tissue', 'Presión profunda para trabajar tensión muscular por debajo de las capas superficiales.', 60, 1700, 170000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000014', 'oxygeneo', 'Oxygeneo', 'Oxigena, exfolia e infunde nutrientes esenciales en un protocolo facial no invasivo.', 60, 2200, 220000, '#111111', true),
  ('a0000000-0000-4000-8000-000000000015', 'diamond-glow', 'Diamond Glow', 'Exfoliación con punta de diamante para limpiar y revitalizar profundamente la piel.', 60, 2550, 255000, '#111111', true)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  price_mxn_minor = excluded.price_mxn_minor,
  color = excluded.color,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.appointment_variants (
  id, appointment_type_id, name, price_mxn_minor, duration_minutes, is_active
) values
  ('47992673763636', 'a0000000-0000-4000-8000-000000000002', 'Deluxe', 180000, 60, true),
  ('47992675729716', 'a0000000-0000-4000-8000-000000000002', 'Platinum', 230000, 60, true),
  ('47992675795252', 'a0000000-0000-4000-8000-000000000002', 'Booster JLO', 300000, 60, true),
  ('48092068118836', 'a0000000-0000-4000-8000-000000000005', 'Espalda: 4 sesiones', 673500, 75, true),
  ('48092046524724', 'a0000000-0000-4000-8000-000000000005', 'Brazos: 4 sesiones', 487000, 75, true),
  ('48092068151604', 'a0000000-0000-4000-8000-000000000005', 'Abdomen: 4 sesiones', 673500, 75, true),
  ('48092068184372', 'a0000000-0000-4000-8000-000000000005', 'Piernas completas: 4 sesiones', 935000, 75, true),
  ('48092149449012', 'a0000000-0000-4000-8000-000000000007', 'Default Title', 225000, 60, true),
  ('48092106129716', 'a0000000-0000-4000-8000-000000000009', 'Cara', 200000, 60, true),
  ('48092113436980', 'a0000000-0000-4000-8000-000000000009', 'Cara y cuello', 250000, 60, true),
  ('48092087451956', 'a0000000-0000-4000-8000-000000000010', 'Default Title', 380000, 60, true),
  ('48018502779188', 'a0000000-0000-4000-8000-000000000011', 'Default Title', 208000, 75, true),
  ('48018502648116', 'a0000000-0000-4000-8000-000000000012', 'Default Title', 151000, 60, true),
  ('48018502385972', 'a0000000-0000-4000-8000-000000000013', 'Default Title', 170000, 60, true),
  ('48092148334900', 'a0000000-0000-4000-8000-000000000014', 'Revive', 220000, 60, true),
  ('48092148367668', 'a0000000-0000-4000-8000-000000000014', 'Illuminate', 220000, 60, true),
  ('48092148400436', 'a0000000-0000-4000-8000-000000000014', 'Balance', 220000, 60, true),
  ('48092148433204', 'a0000000-0000-4000-8000-000000000014', 'Hydrate', 220000, 60, true),
  ('48092148465972', 'a0000000-0000-4000-8000-000000000014', 'Detox', 220000, 60, true),
  ('48092148498740', 'a0000000-0000-4000-8000-000000000014', 'Glam', 220000, 60, true),
  ('47992698798388', 'a0000000-0000-4000-8000-000000000015', 'Default Title', 255000, 60, true)
on conflict (id) do update set
  appointment_type_id = excluded.appointment_type_id,
  name = excluded.name,
  price_mxn_minor = excluded.price_mxn_minor,
  duration_minutes = excluded.duration_minutes,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.availability (doctor_id, day_of_week, start_time, end_time, is_active)
select 'd0000000-0000-4000-8000-000000000001', day_of_week, time '10:00', time '19:00', true
from generate_series(1, 6) as day_of_week
on conflict (doctor_id, day_of_week, start_time, end_time)
do update set is_active = true;

commit;
