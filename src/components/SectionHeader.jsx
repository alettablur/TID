import "./SectionHeader.css";

// on the right: a count ("Today 2") or a short text ("1 of 2 done")
export default function SectionHeader({ title, count, detail }) {
  return (
    <div className="section-header">
      <h2 className="t-section-title">{title}</h2>
      {count !== undefined && (
        <span className="section-header__count t-chip">{count}</span>
      )}
      {detail && <span className="t-meta">{detail}</span>}
    </div>
  );
}
