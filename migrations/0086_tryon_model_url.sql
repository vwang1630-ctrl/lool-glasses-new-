-- Virtual Try-On 3D upgrade (WO-20261008-02): per-color optional GLB model
-- path for the 3D try-on renderer. NULL keeps the legacy 2D PNG fallback
-- (tryon_image_url / images[0]) fully intact — 3D only activates when a
-- model is present AND loads successfully.
ALTER TABLE product_colors ADD COLUMN tryon_model_url TEXT;
