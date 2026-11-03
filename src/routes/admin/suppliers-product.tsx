// /admin/suppliers-product — product-side suppliers (lens labs + frame
// factories + both). Single page after the 0065 merge that put lens/frame
// back into the unified `suppliers` table — the prior split into two admin
// pages (one filtered to lens, one to frame) was redundant once the kind
// column was the only thing that distinguished them.

import { createFileRoute } from "@tanstack/react-router";
import { SuppliersCRUD } from "@/components/admin/SuppliersCRUD";

export const Route = createFileRoute("/admin/suppliers-product")({
  component: () => (
    <SuppliersCRUD
      title="镜片 / 镜框供应商"
      description="镜片厂、镜片实验室、镜框工厂、配件供应商。products.supplier_costs_json 与 lens_skus.supplier_costs_json 的 key 引用此表。"
      kindSet={["lens", "frame", "both"]}
      defaultKind="frame"
      allowKindSelect
    />
  ),
});
