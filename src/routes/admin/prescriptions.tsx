// /admin/prescriptions — read-only prescription list. Filter by source / email.

import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { Loader2, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";

interface Prescription {
  id: string;
  email: string;
  kind: "single" | "reading" | "progressive";
  label_zh: string | null;
  label_en: string | null;
  source: string;
  sph_od: number | null;
  sph_os: number | null;
  cyl_od: number | null;
  cyl_os: number | null;
  axis_od: number | null;
  axis_os: number | null;
  add_od: number | null;
  add_os: number | null;
  prism_od: number | null;
  prism_base_od: string | null;
  prism_os: number | null;
  prism_base_os: string | null;
  pd_total: number | null;
  pd_od_half: number | null;
  pd_os_half: number | null;
  reader_magnification: number | null;
  upload_r2_key: string | null;
  upload_filename: string | null;
  upload_mime: string | null;
  exam_date: number | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

const SOURCES = [
  { value: "", label: "全部来源" },
  { value: "manual", label: "手填" },
  { value: "upload", label: "上传" },
  { value: "measure-pd", label: "Measure-PD" },
  { value: "readers", label: "Readers (老花)" },
];

const SOURCE_COLOR: Record<string, string> = {
  manual: "bg-secondary text-foreground",
  upload: "bg-blue-500/15 text-blue-700",
  "measure-pd": "bg-violet-500/15 text-violet-700",
  readers: "bg-amber-500/15 text-amber-700",
};

const KIND_LABEL: Record<Prescription["kind"], string> = {
  single: "近视 / 单光",
  reading: "老花",
  progressive: "渐进",
};

const KIND_COLOR: Record<Prescription["kind"], string> = {
  single: "bg-sky-500/15 text-sky-700",
  reading: "bg-amber-500/15 text-amber-700",
  progressive: "bg-emerald-500/15 text-emerald-700",
};

const fmtNum = (v: number | null, d = 2): string =>
  v == null ? "—" : v.toFixed(d);

export const Route = createFileRoute("/admin/prescriptions")({
  component: AdminPrescriptionsPage,
});

function AdminPrescriptionsPage() {
  const [items, setItems] = useState<Prescription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      if (sourceFilter) params.set("source", sourceFilter);
      if (emailQuery.trim()) params.set("email", emailQuery.trim());
      const r = await fetch(`/api/admin/prescriptions?${params}`, {
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as {
        prescriptions: Prescription[];
        total: number;
      };
      setItems(d.prescriptions);
      setTotal(d.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [sourceFilter, page]);

  useEffect(() => {
    setPage(0);
  }, [sourceFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">处方记录</h1>
        <p className="text-sm text-muted-foreground">
          客户上传 / 手填 / measure-pd / readers 来源的全部处方记录。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <input
          placeholder="按邮箱搜索"
          value={emailQuery}
          onChange={(e) => setEmailQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(0);
              load();
            }
          }}
          className="h-9 w-72 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-ring"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setPage(0);
            load();
          }}
          className="h-9 rounded-md border border-border px-3 text-sm hover:bg-secondary"
        >
          搜索
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {loading ? "加载中…" : `共 ${total} 条`}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="w-8 px-2 py-3"></th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">邮箱</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">来源</th>
              <th className="px-4 py-3">SPH (OD/OS)</th>
              <th className="px-4 py-3">CYL (OD/OS)</th>
              <th className="px-4 py-3">ADD (OD/OS)</th>
              <th className="px-4 py-3">PD</th>
              <th className="px-4 py-3">附件</th>
              <th className="px-4 py-3">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-muted-foreground"
                >
                  暂无处方记录
                </td>
              </tr>
            ) : (
              items.map((p) => {
                const isExpanded = expanded.has(p.id);
                return (
                  <Fragment key={p.id}>
                    <tr className="hover:bg-secondary/30">
                      <td className="px-2 py-3">
                        <button
                          onClick={() => toggleExpand(p.id)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title={isExpanded ? "收起详情" : "展开详情"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" title={p.id}>
                        {p.id.slice(0, 10)}…
                      </td>
                      <td className="px-4 py-3 text-xs">{p.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            KIND_COLOR[p.kind] ?? "bg-muted"
                          }`}
                        >
                          {KIND_LABEL[p.kind] ?? p.kind}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                            SOURCE_COLOR[p.source] ?? "bg-muted"
                          }`}
                        >
                          {p.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {fmtNum(p.sph_od)} / {fmtNum(p.sph_os)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {fmtNum(p.cyl_od)} / {fmtNum(p.cyl_os)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {fmtNum(p.add_od)} / {fmtNum(p.add_os)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {fmtNum(p.pd_total, 1)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.upload_r2_key ? (
                          <a
                            href={`/api/admin/rx/${encodeURI(p.upload_r2_key)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            title={p.upload_r2_key}
                          >
                            <FileText className="h-3 w-3" />
                            {p.upload_filename ?? "附件"}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(p.created_at)
                          .toISOString()
                          .slice(0, 16)
                          .replace("T", " ")}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-secondary/20">
                        <td></td>
                        <td colSpan={10} className="px-4 py-3 text-xs">
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
                            <DetailField label="标签 zh" value={p.label_zh} />
                            <DetailField label="标签 en" value={p.label_en} />
                            <DetailField
                              label="AXIS (OD/OS)"
                              value={`${p.axis_od ?? "—"} / ${p.axis_os ?? "—"}`}
                              mono
                            />
                            <DetailField
                              label="PRISM OD"
                              value={
                                p.prism_od == null && !p.prism_base_od
                                  ? null
                                  : `${fmtNum(p.prism_od)} ${p.prism_base_od ?? ""}`.trim()
                              }
                              mono
                            />
                            <DetailField
                              label="PRISM OS"
                              value={
                                p.prism_os == null && !p.prism_base_os
                                  ? null
                                  : `${fmtNum(p.prism_os)} ${p.prism_base_os ?? ""}`.trim()
                              }
                              mono
                            />
                            <DetailField
                              label="PD half (OD/OS)"
                              value={
                                p.pd_od_half == null && p.pd_os_half == null
                                  ? null
                                  : `${fmtNum(p.pd_od_half, 1)} / ${fmtNum(p.pd_os_half, 1)}`
                              }
                              mono
                            />
                            <DetailField
                              label="阅读放大倍数"
                              value={
                                p.reader_magnification == null
                                  ? null
                                  : `+${fmtNum(p.reader_magnification, 2)}`
                              }
                              mono
                            />
                            <DetailField
                              label="验光日期"
                              value={
                                p.exam_date
                                  ? new Date(p.exam_date)
                                      .toISOString()
                                      .slice(0, 10)
                                  : null
                              }
                            />
                            <DetailField
                              label="附件 MIME"
                              value={p.upload_mime}
                              mono
                            />
                            <DetailField
                              label="附件 R2 key"
                              value={p.upload_r2_key}
                              mono
                            />
                            <DetailField
                              label="更新时间"
                              value={new Date(p.updated_at)
                                .toISOString()
                                .slice(0, 16)
                                .replace("T", " ")}
                            />
                          </div>
                          {p.notes && (
                            <div className="mt-3 border-t border-border/60 pt-3">
                              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                                备注 notes
                              </div>
                              <p className="whitespace-pre-wrap text-foreground/90">
                                {p.notes}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}) {
  const empty = value == null || value === "";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`${mono ? "font-mono" : ""} ${empty ? "text-muted-foreground" : "text-foreground"}`}
      >
        {empty ? "—" : value}
      </div>
    </div>
  );
}
