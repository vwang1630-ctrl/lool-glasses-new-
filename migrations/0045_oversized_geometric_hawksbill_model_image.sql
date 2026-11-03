-- Insert the model-worn photo as images[1] for the Oversized Geometric
-- hawksbill color. ProductCard hover-flip surfaces images[1], so the card
-- now flips to this shot instead of the legacy static-fallback image.
UPDATE product_colors
SET images_json = '["/api/admin/r2/product/rUo0lt0ZH00DmDC17RQTl.jpg","/api/admin/r2/product/S2F3yfXVppCgTJ2jIpF27.jpg","/api/admin/r2/product/jcGB36OQuq1Ux2E6Vm9mp.png","/api/admin/r2/product/9l3TnxcddKW9L2HovYqNX.jpg","/api/admin/r2/product/J4EuLRTDRF5QomUrWYtI6.jpg","/api/admin/r2/product/853JQkNzlBLSAFOi5aNZb.jpg","/api/admin/r2/product/ECIEtqlonq0DInh45NNWy.jpg"]'
WHERE product_id = 'uppno9AbVicY9GT54snVR' AND color_id = 'hawksbill-8668';
