-- Snapshot prescription data onto order_items at order-creation time.
--
-- Before: order_items.prescription_id only carried the FK; the actual Rx
-- numbers lived in the prescriptions table, which the customer can edit
-- after the order is placed. Makers reading historical orders would see
-- whatever the customer's *current* Rx is, not what they bought with.
--
-- After: every Rx field that lives on prescriptions has a paired
-- rx_*_snapshot column on order_items. Order creation copies the Rx row
-- once; reads go to the snapshot. The prescription_id still exists for
-- audit / traceability.
--
-- All snapshot columns are nullable — frame-only items and no-Rx lenses
-- legitimately leave them blank.

ALTER TABLE order_items ADD COLUMN rx_source                TEXT;
ALTER TABLE order_items ADD COLUMN rx_label_zh              TEXT;
ALTER TABLE order_items ADD COLUMN rx_label_en              TEXT;

ALTER TABLE order_items ADD COLUMN rx_sph_od                REAL;
ALTER TABLE order_items ADD COLUMN rx_sph_os                REAL;
ALTER TABLE order_items ADD COLUMN rx_cyl_od                REAL;
ALTER TABLE order_items ADD COLUMN rx_cyl_os                REAL;
ALTER TABLE order_items ADD COLUMN rx_axis_od               INTEGER;
ALTER TABLE order_items ADD COLUMN rx_axis_os               INTEGER;
ALTER TABLE order_items ADD COLUMN rx_add_od                REAL;
ALTER TABLE order_items ADD COLUMN rx_add_os                REAL;
ALTER TABLE order_items ADD COLUMN rx_prism_od              REAL;
ALTER TABLE order_items ADD COLUMN rx_prism_base_od         TEXT;
ALTER TABLE order_items ADD COLUMN rx_prism_os              REAL;
ALTER TABLE order_items ADD COLUMN rx_prism_base_os         TEXT;
ALTER TABLE order_items ADD COLUMN rx_pd_total              REAL;
ALTER TABLE order_items ADD COLUMN rx_pd_od_half            REAL;
ALTER TABLE order_items ADD COLUMN rx_pd_os_half            REAL;
ALTER TABLE order_items ADD COLUMN rx_reader_magnification  REAL;
ALTER TABLE order_items ADD COLUMN rx_exam_date             INTEGER;
ALTER TABLE order_items ADD COLUMN rx_notes                 TEXT;
