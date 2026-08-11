import React from "react";

function Meter({ actual, target, tone }) {
  const pct = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  return (
    <div className={`meter ${tone || ""}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StatsPanel({ stats }) {
  if (!stats) return null;
  const { totals, targets } = stats;

  return (
    <>
      <div className="stats-strip">
        <div className="stat-cell">
          <div className="label">Prospects added</div>
          <div className="figure">
            <span className="actual">{totals.prospectsAdded}</span>
            <span className="target">/ {targets.total.prospectsAdded}</span>
          </div>
          <Meter actual={totals.prospectsAdded} target={targets.total.prospectsAdded} />
        </div>
        <div className="stat-cell">
          <div className="label">Contacts made</div>
          <div className="figure">
            <span className="actual">{totals.contactsMade}</span>
            <span className="target">/ {targets.total.contactsMade}</span>
          </div>
          <Meter actual={totals.contactsMade} target={targets.total.contactsMade} />
        </div>
        <div className="stat-cell interviews">
          <div className="label">Interviews booked</div>
          <div className="figure">
            <span className="actual">{totals.interviewsBooked}</span>
            <span className="target">/ {targets.total.interviewsBooked}</span>
          </div>
          <Meter actual={totals.interviewsBooked} target={targets.total.interviewsBooked} />
        </div>
      </div>

      <div className="week-strip">
        {targets.weekly.map((wk) => {
          const actual = (stats.byWeek || []).find((w) => w._id === wk.week);
          return (
            <div className="week-cell" key={wk.week}>
              <div className="wk-label">Week {wk.week}</div>
              <div className="wk-row">
                <span>Prospects</span>
                <b>
                  {actual ? actual.prospectsAdded : 0} / {wk.prospectsAdded}
                </b>
              </div>
              <div className="wk-row">
                <span>Contacts</span>
                <b>
                  {actual ? actual.contactsMade : 0} / {wk.contactsMade}
                </b>
              </div>
              <div className="wk-row">
                <span>Interviews</span>
                <b>
                  {actual ? actual.interviewsBooked : 0} / {wk.interviewsBooked}
                </b>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
