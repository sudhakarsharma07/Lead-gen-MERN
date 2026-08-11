import React from "react";

function pct(n, d) {
  if (!d) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

export default function ReportsPanel({ stats }) {
  if (!stats) return null;
  const { byMessageVersion = [], byJobTitle = [] } = stats;

  return (
    <div>
      <div className="section-note">
        Outreach performance report (brief section 8.3) — messages sent per version, reply
        rate, and booking rate, plus the same broken down by job title.
      </div>

      <h3 className="report-heading">By message version</h3>
      <div className="report-table">
        <div className="report-row report-head">
          <div>Version</div>
          <div>Sent</div>
          <div>Replied</div>
          <div>Reply rate</div>
          <div>Booked</div>
          <div>Booking rate</div>
        </div>
        {byMessageVersion.length === 0 && (
          <div className="empty-state">No outreach logged yet.</div>
        )}
        {byMessageVersion.map((row) => (
          <div className="report-row" key={row._id}>
            <div><b>Version {row._id}</b></div>
            <div>{row.sent}</div>
            <div>{row.replied}</div>
            <div>{pct(row.replied, row.sent)}</div>
            <div>{row.booked}</div>
            <div>{pct(row.booked, row.sent)}</div>
          </div>
        ))}
      </div>

      <h3 className="report-heading">By job title</h3>
      <div className="report-table">
        <div className="report-row report-head">
          <div>Job title</div>
          <div>Total</div>
          <div>Replied</div>
          <div>Reply rate</div>
          <div>Booked</div>
          <div>Booking rate</div>
        </div>
        {byJobTitle.length === 0 && (
          <div className="empty-state">No job titles recorded yet.</div>
        )}
        {byJobTitle.map((row) => (
          <div className="report-row" key={row._id}>
            <div>{row._id}</div>
            <div>{row.total}</div>
            <div>{row.replied}</div>
            <div>{pct(row.replied, row.total)}</div>
            <div>{row.booked}</div>
            <div>{pct(row.booked, row.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
