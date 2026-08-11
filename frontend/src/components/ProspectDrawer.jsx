import React, { useEffect, useState } from "react";
import { nextActionInfo, MAX_FOLLOW_UPS } from "../sequence";

const STATUS_VALUES = ["Not contacted", "Contacted", "Replied", "Booked", "Declined"];
const CHANNEL_VALUES = ["LinkedIn", "Email", "Phone"];
const ENTITY_TYPE_VALUES = [
  "Limited company",
  "LLP",
  "Public body",
  "Sole trader",
  "Unincorporated partnership",
  "Unknown",
];
const MESSAGE_VERSIONS = ["A", "B", "C"];

const BLANK = {
  companyName: "",
  website: "",
  country: "UK",
  city: "",
  entityType: "Unknown",
  estimatedUnits: "",
  employeeCount: "",
  contactName: "",
  jobTitle: "",
  linkedinUrl: "",
  email: "",
  emailVerified: false,
  phone: "",
  currentSoftware: "",
  signal: "",
  source: "",
  status: "Not contacted",
  channelUsed: "",
  messageVersion: "A",
  weekAdded: 1,
  interviewBooked: false,
  interviewHeld: false,
  sequenceStep: "Not started",
  sequenceStartDate: "",
  followUpsSent: 0,
  legitimateInterestNote: "",
  notes: "",
};

export default function ProspectDrawer({ prospect, onClose, onSave, onDelete, onDecline, onAdvance }) {
  const [form, setForm] = useState(BLANK);
  const isEdit = Boolean(prospect && prospect._id);

  useEffect(() => {
    setForm(prospect ? { ...BLANK, ...prospect } : BLANK);
  }, [prospect]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const needsConsent = ["Sole trader", "Unincorporated partnership"].includes(form.entityType);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      estimatedUnits: form.estimatedUnits === "" ? undefined : Number(form.estimatedUnits),
      employeeCount: form.employeeCount === "" ? undefined : Number(form.employeeCount),
      weekAdded: form.weekAdded === "" ? undefined : Number(form.weekAdded),
    };
    onSave(payload, prospect?._id);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-eyebrow">{isEdit ? "Edit record" : "New record"}</div>
        <h2>{isEdit ? form.companyName || "Prospect" : "Add a prospect"}</h2>

        {needsConsent && (
          <div className="section-note" style={{ marginTop: 16 }}>
            This entity type needs opt-in consent before emailing under UK GDPR/PECR — use
            LinkedIn or phone first, per the compliance rules in the brief.
          </div>
        )}

        {isEdit && (
          <SequenceTracker
            prospect={form}
            onAdvance={(channel) => onAdvance(prospect._id, channel)}
          />
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="field-grid">
            <div className="field">
              <label>Company name</label>
              <input required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
            </div>
            <div className="field">
              <label>Website</label>
              <input value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Country</label>
              <input value={form.country} onChange={(e) => update("country", e.target.value)} />
            </div>
            <div className="field">
              <label>City</label>
              <input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Entity type</label>
              <select value={form.entityType} onChange={(e) => update("entityType", e.target.value)}>
                {ENTITY_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Source</label>
              <input value={form.source} onChange={(e) => update("source", e.target.value)} placeholder="e.g. Companies House SIC 68320" />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Estimated units managed</label>
              <input type="number" min="0" value={form.estimatedUnits} onChange={(e) => update("estimatedUnits", e.target.value)} />
            </div>
            <div className="field">
              <label>Employee count</label>
              <input type="number" min="0" value={form.employeeCount} onChange={(e) => update("employeeCount", e.target.value)} />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Contact name</label>
              <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
            </div>
            <div className="field">
              <label>Job title</label>
              <input value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="Operations Director" />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Email (verified only)</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="field">
              <label>Email verified?</label>
              <select value={form.emailVerified ? "yes" : "no"} onChange={(e) => update("emailVerified", e.target.value === "yes")}>
                <option value="no">Not verified</option>
                <option value="yes">Verified</option>
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Current software</label>
              <input value={form.currentSoftware} onChange={(e) => update("currentSoftware", e.target.value)} placeholder="Arthur, Reapit, Fixflo..." />
            </div>
            <div className="field">
              <label>Signal / trigger</label>
              <input value={form.signal} onChange={(e) => update("signal", e.target.value)} placeholder="Recent funding, hiring, complaint..." />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => update("status", e.target.value)}>
                {STATUS_VALUES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Channel used</label>
              <select value={form.channelUsed || ""} onChange={(e) => update("channelUsed", e.target.value)}>
                <option value="">—</option>
                {CHANNEL_VALUES.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Message version</label>
              <select value={form.messageVersion} onChange={(e) => update("messageVersion", e.target.value)}>
                {MESSAGE_VERSIONS.map((v) => (
                  <option key={v} value={v}>Version {v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Week added</label>
              <select value={form.weekAdded} onChange={(e) => update("weekAdded", e.target.value)}>
                {[1, 2, 3, 4].map((v) => (
                  <option key={v} value={v}>Week {v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label>Interview booked?</label>
              <select value={form.interviewBooked ? "yes" : "no"} onChange={(e) => update("interviewBooked", e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="field">
              <label>Interview held?</label>
              <select value={form.interviewHeld ? "yes" : "no"} onChange={(e) => update("interviewHeld", e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="field-grid full">
            <div className="field">
              <label>Legitimate interest assessment</label>
              <textarea
                value={form.legitimateInterestNote}
                onChange={(e) => update("legitimateInterestNote", e.target.value)}
                placeholder="Why we believe this person would reasonably expect contact..."
              />
            </div>
          </div>

          <div className="field-grid full">
            <div className="field">
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
          </div>

          <div className="drawer-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ marginLeft: 0 }}>
              {isEdit ? "Save changes" : "Add prospect"}
            </button>
            {isEdit && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDecline(prospect._id)}
              >
                Mark declined + suppress
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function SequenceTracker({ prospect, onAdvance }) {
  const info = nextActionInfo(prospect);
  const stopped = prospect.sequenceStep === "Stopped";
  const finished = !stopped && !info;

  return (
    <div className="sequence-tracker">
      <div className="drawer-eyebrow" style={{ marginBottom: 8 }}>Outreach sequence</div>
      <div className="sequence-status-row">
        <span className="status-tag status-Contacted">{prospect.sequenceStep}</span>
        <span className="template-meta">
          Follow-ups used: {prospect.followUpsSent || 0} / {MAX_FOLLOW_UPS}
        </span>
      </div>

      {stopped && (
        <div className="section-note" style={{ marginTop: 10 }}>
          Sequence stopped — no further contact.
        </div>
      )}

      {finished && (
        <div className="section-note" style={{ marginTop: 10, borderColor: "var(--rust)" }}>
          Day 12 follow-up sent with no reply. Per the brief: mark as declined and stop —
          three ignored touches is not a lead.
        </div>
      )}

      {info && (
        <div className={`section-note ${info.overdue ? "overdue" : ""}`} style={{ marginTop: 10 }}>
          Next: <b>{info.label}</b>
          {info.dueDate ? (
            <> — due {info.dueDate.toLocaleDateString()}{info.overdue ? " (overdue)" : ""}</>
          ) : (
            <> — start the sequence to set a due date</>
          )}
        </div>
      )}

      {!stopped && !finished && (
        <button type="button" className="btn-ghost" style={{ marginTop: 10 }} onClick={() => onAdvance(prospect.channelUsed)}>
          Mark "{info?.label}" as sent
        </button>
      )}
    </div>
  );
}
