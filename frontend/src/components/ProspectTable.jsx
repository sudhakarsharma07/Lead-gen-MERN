import React from "react";
import PipelineStrip from "./PipelineStrip";
import { nextActionInfo } from "../sequence";

const statusClass = (status) => `status-tag status-${status.replace(/\s+/g, "-")}`;

export default function ProspectTable({ prospects, onSelect, onDelete }) {
  if (!prospects.length) {
    return (
      <div className="ledger">
        <div className="empty-state">
          No prospects match this filter yet. Add one, or widen the filter.
        </div>
      </div>
    );
  }

  return (
    <div className="ledger">
      <div className="ledger-head">
        <div>Company</div>
        <div>Contact</div>
        <div>Units / Employees</div>
        <div>Software / Source</div>
        <div>Status</div>
        <div></div>
      </div>
      {prospects.map((p) => {
        const due = nextActionInfo(p);
        return (
        <div className="ledger-row" key={p._id} onClick={() => onSelect(p)}>
          <div className="cell-company">
            <div className="name">{p.companyName}</div>
            <div className="meta">
              {[p.city, p.country].filter(Boolean).join(", ") || "—"}
            </div>
            {due?.overdue && <div className="due-badge">Overdue: {due.label}</div>}
          </div>
          <div className="cell-contact">
            <div className="name">{p.contactName || "—"}</div>
            <div className="title">{p.jobTitle || ""}</div>
          </div>
          <div className="cell-units">
            <b>{p.estimatedUnits ?? "—"}</b> units · <b>{p.employeeCount ?? "—"}</b> staff
          </div>
          <div className="cell-units">
            {p.currentSoftware || "Unknown"}
            <div className="meta" style={{ marginTop: 2 }}>{p.source || ""}</div>
          </div>
          <div>
            <span className={statusClass(p.status)}>{p.status}</span>
            <div style={{ marginTop: 6 }}>
              <PipelineStrip status={p.status} />
            </div>
          </div>
          <div className="row-actions">
            <button
              className="icon-btn"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete ${p.companyName}?`)) onDelete(p._id);
              }}
            >
              ×
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
}
