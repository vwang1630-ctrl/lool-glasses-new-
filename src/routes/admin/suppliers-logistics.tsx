// /admin/suppliers-logistics — logistics / carrier providers (DHL / EMS / 顺丰国际 / 等).
//
// Each carrier may have multiple logistics agents — maintained on the
// sibling /admin/logistics-contacts page. This page intentionally hides the
// supplier-level contact_person/email/phone columns to steer users there.

import { createFileRoute, Link } from "@tanstack/react-router";
import { SuppliersCRUD } from "@/components/admin/SuppliersCRUD";

export const Route = createFileRoute("/admin/suppliers-logistics")({
  component: () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
        每位承运商的货代代理（如 DHL - 张三、顺丰 - 张三）请到{" "}
        <Link
          to="/admin/logistics-contacts"
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          货代代理
        </Link>{" "}
        维护。
      </div>
      <SuppliersCRUD
        title="物流供应商"
        description="承运商与物流代理记录。FK：shipments.carrier 是文字字段，未做 FK；这里维护可选清单。"
        kindSet={["logistics"]}
        defaultKind="logistics"
        hideContactFields
      />
    </div>
  ),
});
