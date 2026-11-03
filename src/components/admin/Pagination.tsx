// Shared pagination control for admin list pages.
// Hidden when totalPages <= 1.

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="h-8 rounded-md border border-border px-3 text-sm hover:bg-secondary disabled:opacity-50"
      >
        上一页
      </button>
      <span className="text-sm text-muted-foreground">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="h-8 rounded-md border border-border px-3 text-sm hover:bg-secondary disabled:opacity-50"
      >
        下一页
      </button>
    </div>
  );
}
