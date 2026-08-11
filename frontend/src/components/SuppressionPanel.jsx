import React from "react";

export default function SuppressionPanel({ list, onRemove }) {
  return (
    <div>
      <div className="section-note">
        Permanent opt-out list. Anyone here is blocked from being re-added with the same
        email — honour opt-outs within days, per the compliance rules.
      </div>
      <div className="suppression-list">
        {list.length === 0 && (
          <div className="empty-state">No suppressions yet — nobody has opted out.</div>
        )}
        {list.map((s) => (
          <div className="suppression-row" key={s._id}>
            <div className="email">{s.email || "—"}</div>
            <div>{s.companyName || "—"}</div>
            <div className="muted">{s.reason}</div>
            <div className="muted">{new Date(s.dateAdded).toLocaleDateString()}</div>
            <button className="icon-btn" onClick={() => onRemove(s._id)} title="Remove">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
