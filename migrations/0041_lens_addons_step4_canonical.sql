-- 0041 — align lens_addons with wizard step 4 (涂层多选).
--
-- Canonical step-4 addons (5 multi-selectable items; "no coating" is implicit when
-- user prick none):
--   anti-reflective    减反射涂层
--   anti-scratch       抗划伤涂层
--   hydrophobic        防水涂层
--   anti-fog           防雾涂层
--   blue-light-coating 防蓝光涂层  ← orthogonal to base_function='blue-light-absorbing'
--
-- Existing rows in lens_addons (post-0035):
--   'anti-reflective'      keep, refresh label
--   'super-hydrophobic'    deactivate (replaced by 'hydrophobic')
--   'scratch-resistant'    deactivate (replaced by 'anti-scratch')
--   'uv-protection'        deactivate (not in step 4)
--   'prism' / 'thinning'   keep (kind='service' — not coatings; remain for admin)
--
-- New rows: hydrophobic / anti-scratch / anti-fog / blue-light-coating.
-- 'anti-reflective' is kept (same id) — just refresh its label/sort_order.

-- ── Refresh existing 'anti-reflective' ─────────────────────────────────────
UPDATE lens_addons
   SET retail_cents = 495,
       label_json   = '{"zh":"减反射涂层","en":"Anti-Reflective Coating"}',
       description_json = '{"zh":"减少镜面眩光与倒影，提升透光度。","en":"Cuts glare and ghost reflections; boosts visible light transmission."}',
       sort_order   = 10,
       active       = 1
 WHERE id = 'anti-reflective';

-- ── Deactivate legacy / out-of-step-4 rows ─────────────────────────────────
UPDATE lens_addons SET active = 0
 WHERE id IN ('super-hydrophobic','scratch-resistant','uv-protection');

-- ── Insert new canonical addons ────────────────────────────────────────────
INSERT INTO lens_addons (id, kind, retail_cents, applies_to_kinds_json, active, sort_order, label_json, description_json)
VALUES
  ('anti-scratch',       'coating',  495, '["eyeglasses","sunglasses"]', 1, 20,
   '{"zh":"抗划伤涂层","en":"Anti-Scratch Coating"}',
   '{"zh":"硬质涂层显著降低镜面划痕风险。","en":"Hard coating that significantly reduces surface scratches."}'),
  ('hydrophobic',        'coating',  495, '["eyeglasses","sunglasses"]', 1, 30,
   '{"zh":"防水涂层","en":"Hydrophobic Coating"}',
   '{"zh":"拒水拒油，水滴自动滑落，更易擦拭。","en":"Repels water and oil; droplets roll off and lenses wipe clean fast."}'),
  ('anti-fog',           'coating',  595, '["eyeglasses","sunglasses"]', 1, 40,
   '{"zh":"防雾涂层","en":"Anti-Fog Coating"}',
   '{"zh":"温差与口罩呼吸场景下不起雾。","en":"Keeps lenses clear in temperature shifts and mask-wearing scenarios."}'),
  ('blue-light-coating', 'coating', 1000, '["eyeglasses","sunglasses"]', 1, 50,
   '{"zh":"防蓝光涂层","en":"Blue-Light Filter Coating"}',
   '{"zh":"在 AR 基础上叠加反射型蓝光层；与吸收型基片选项独立。","en":"Reflective blue-light layer added on top of AR; independent of the substrate-absorbing option."}');
