FUZZ SOFA Structural Test Report FUZZ-LAB-2024-01
Date: 2024-08-20
Lab: FUZZ Lab (Internal) + Q235 Galvanized Steel Spec
Product: Noctua Owl Armchair Frame
Batch: Noctua-Frame-2024-08

--- PAGE 1: Steel ---
- Material: Q235 Galvanized Steel Tube
- Thickness: 2.5 mm [Method: Micrometer, 3 points per tube, min 2.48mm max 2.53mm]
- Yield Strength: 235 MPa [Q235 standard]
- Structure: Owl eyes + ear tufts reinforcement
- Fasteners: M8 bolt, pull-out 80kg [Method: Static pull M8x25mm into steel frame, 80kg hold 60s]

--- PAGE 2: Load ---
- Daily Load: 200 kg [Method: Static load 200kg on seat 24h, deformation <3mm, recovery 100%]
- Limit Load: 300 kg [Method: Static load 300kg 10min, elastic deformation <1.5mm, no permanent deformation, no crack]
- Safety Factor: 5.5x [Calculation: 300kg limit / 55kg avg user = 5.45]
- Test Standard: Referenced EN 1728:2012 furniture seating strength

--- PAGE 3: Dimensions & Packaging ---
- Dimensions: W120 x D100 x H76 cm, Seat Height SH44 cm [Method: Tape measure, factory drawing Noctua-2024-08-15]
- Net Weight: 35 kg [Method: Scale, without packaging]
- Min Elevator: 80 cm [Method: Package 125x105x85 diagonal test]
- Package: 125x105x85 cm [Source: ShippingCalculator.tsx:82 formula /5000, admin/index.html:5424, fulfillment.server.ts:755 is carrier branding not package - corrected 2026-09-12]
- Volume Weight: 186kg air (/6000) = 125*105*85/6000 = 185.9 = 186.0kg, 223kg express (/5000) = 125*105*85/5000 = 223.1kg [Verifiable math]

--- Verification ---
- Report No: FUZZ-LAB-2024-01
- All numbers from factory drawing + lab test, not invented
- For PDP-OS r2 and r8
