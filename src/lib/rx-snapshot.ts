// Shape of a per-order Rx snapshot — numeric fields aligned 1:1 with the
// `order_items.rx_*` snapshot columns. Used to carry user-entered prescription
// values through the wizard → cart → checkout → POST /api/orders chain so the
// order ends up with concrete rx data instead of a NULL "missing prescription"
// (the earlier flow only forwarded a prescriptionId which was usually absent
// for anonymous checkouts, and never produced by the wizard for any user).
export interface RxSnapshot {
  source: "manual" | "upload" | "measure-pd" | "saved";
  sphOd: number | null;
  sphOs: number | null;
  cylOd: number | null;
  cylOs: number | null;
  axisOd: number | null;
  axisOs: number | null;
  addOd: number | null;
  addOs: number | null;
  pdTotal: number | null;
  pdOdHalf: number | null;
  pdOsHalf: number | null;
}

/** True when at least one diopter / PD field has a value worth snapshotting. */
export function rxSnapshotHasData(rx: RxSnapshot | null | undefined): boolean {
  if (!rx) return false;
  return (
    rx.sphOd != null ||
    rx.sphOs != null ||
    rx.cylOd != null ||
    rx.cylOs != null ||
    rx.addOd != null ||
    rx.addOs != null ||
    rx.pdTotal != null ||
    rx.pdOdHalf != null ||
    rx.pdOsHalf != null
  );
}
