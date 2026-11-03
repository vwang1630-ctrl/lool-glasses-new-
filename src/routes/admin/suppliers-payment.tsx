// /admin/suppliers-payment — payment provider account records.

import { createFileRoute } from "@tanstack/react-router";
import { SuppliersCRUD } from "@/components/admin/SuppliersCRUD";

export const Route = createFileRoute("/admin/suppliers-payment")({
  component: () => (
    <SuppliersCRUD
      title="支付供应商"
      description="收单 / 支付服务商记录。当前线上主流程使用 Stripe。"
      kindSet={["payment"]}
      defaultKind="payment"
    />
  ),
});
