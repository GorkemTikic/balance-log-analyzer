// src/components/TypeFilter.tsx
import React from "react";

export type TypeFilterProps = {
  types: string[];                 // elde edilen tüm TYPE anahtarları
  counts?: Record<string, number>; // isteğe bağlı: her TYPE için satır sayısı
  selected: Set<string>;           // seçili TYPE’lar (boşsa hepsi anlamına gelir)
  onChange: (next: Set<string>) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
};

export default function TypeFilter({
  types,
  counts = {},
  selected,
  onChange,
  onSelectAll,
  onClear,
}: TypeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!types.length) return null;

  const toggle = (t: string) => {
    const n = new Set(selected);
    if (n.has(t)) n.delete(t);
    else n.add(t);
    onChange(n);
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <button
        className="section-head"
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h3 className="section-title">Types</h3>
          <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>
            ({selected.size === 0 ? "All" : selected.size} selected)
          </span>
        </div>
        <div style={{ color: "#94a3b8" }}>{isOpen ? "Hide ▲" : "Show ▼"}</div>
      </button>

      {isOpen && (
        <div style={{ marginTop: 12 }}>
          <div className="btn-row" style={{ marginBottom: 12 }}>
            <button className="btn" onClick={onSelectAll}>Select All</button>
            <button className="btn" onClick={onClear}>Clear</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {types.map((t) => {
              const isOn = selected.size === 0 || selected.has(t);
              return (
                <button
                  key={t}
                  className="btn"
                  onClick={() => toggle(t)}
                  title={t}
                  style={{
                    borderColor: isOn ? "#111827" : undefined,
                    background: isOn ? "#111827" : "#fff",
                    color: isOn ? "#fff" : undefined,
                  }}
                >
                  <span className="mono small">{t}</span>
                  {typeof counts[t] === "number" ? (
                    <span className="mono small" style={{ opacity: 0.8 }}> · {counts[t]}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
