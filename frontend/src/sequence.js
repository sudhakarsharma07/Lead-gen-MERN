// Mirrors the brief's outreach sequence (section 6):
// Day 1 LinkedIn request -> Day 3 message -> Day 6 email -> Day 12 final follow-up -> stop.
export const SEQUENCE_STEPS = ["Not started", "Day 1 sent", "Day 3 sent", "Day 6 sent", "Day 12 sent", "Stopped"];

export const SEQUENCE_OFFSETS_DAYS = {
  "Day 1 sent": 1,
  "Day 3 sent": 3,
  "Day 6 sent": 6,
  "Day 12 sent": 12,
};

export const MAX_FOLLOW_UPS = 2;

export function nextStepFor(sequenceStep) {
  const i = SEQUENCE_STEPS.indexOf(sequenceStep || "Not started");
  const next = SEQUENCE_STEPS[i + 1];
  if (!next || next === "Stopped") return null;
  return next;
}

// Returns { label, dueDate, overdue } describing what's due next, or null if the
// sequence is finished/stopped or hasn't started.
export function nextActionInfo(prospect) {
  if (!prospect) return null;
  const { sequenceStep, sequenceStartDate } = prospect;
  if (sequenceStep === "Stopped") return null;

  const next = nextStepFor(sequenceStep);
  if (!next) return null;

  // Sequence hasn't started yet — there's no anchor date to project from.
  if (!sequenceStartDate) {
    return { label: next.replace(" sent", ""), dueDate: null, overdue: false };
  }

  const start = new Date(sequenceStartDate);
  const due = new Date(start.getTime() + SEQUENCE_OFFSETS_DAYS[next] * 24 * 60 * 60 * 1000);
  const overdue = due < new Date();
  return { label: next.replace(" sent", ""), dueDate: due, overdue };
}
