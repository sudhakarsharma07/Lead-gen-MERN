import React from "react";

// Signature element: 5 ticks mirror the outreach sequence in the brief
// (Day 1 LinkedIn request -> Day 3 message -> Day 6 email -> Day 12 follow-up -> outcome).
const STAGES = ["Not contacted", "Contacted", "Replied", "Booked", "Declined"];

export default function PipelineStrip({ status }) {
  const currentIndex = STAGES.indexOf(status);
  const isDeclined = status === "Declined";

  return (
    <div className="pipeline" title={status}>
      {STAGES.slice(0, 4).map((stage, i) => {
        const filled = !isDeclined && i <= currentIndex;
        const done = stage === "Booked" && filled;
        return (
          <span
            key={stage}
            className={`tick ${filled ? "filled" : ""} ${done ? "done" : ""}`}
          />
        );
      })}
      {isDeclined && <span className="tick declined filled" />}
    </div>
  );
}
