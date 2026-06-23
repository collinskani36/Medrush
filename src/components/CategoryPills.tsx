import { CATEGORIES } from "@/config";

interface Props {
  active: string | null;
  onChange: (cat: string | null) => void;
}

export function CategoryPills({ active, onChange }: Props) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
      <div className="flex gap-2 pb-1">
        <Pill label="All" active={active === null} onClick={() => onChange(null)} />
        {CATEGORIES.map((c) => (
          <Pill key={c} label={c} active={active === c} onClick={() => onChange(c)} />
        ))}
      </div>
    </div>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground/80 hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </button>
  );
}
