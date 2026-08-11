import React, { useState } from "react";

const VERSIONS = ["A", "B", "C"];
const CHANNELS = ["LinkedIn", "Email", "Phone"];
const STEPS = ["Day 1 sent", "Day 3 sent", "Day 6 sent", "Day 12 sent"];
const WORD_LIMIT = 90;

const BLANK = { version: "A", channel: "LinkedIn", sequenceStep: "Day 1 sent", body: "" };

export default function TemplatesPanel({ templates, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const wordCount = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;
  const overLimit = wordCount > WORD_LIMIT;

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({ version: t.version, channel: t.channel, sequenceStep: t.sequenceStep, body: t.body });
    setError("");
  };
  const resetForm = () => {
    setEditingId(null);
    setForm(BLANK);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await onUpdate(editingId, form);
      } else {
        await onCreate(form);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || "Could not save this template.");
    }
  };

  return (
    <div>
      <div className="section-note">
        Message principles from the brief: ask for their expertise, not their time. Under{" "}
        {WORD_LIMIT} words. Never mention a product, a demo, or pricing.
      </div>

      <form onSubmit={handleSubmit} className="template-form">
        <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="field">
            <label>Version</label>
            <select value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}>
              {VERSIONS.map((v) => <option key={v} value={v}>Version {v}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Channel</label>
            <select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}>
              {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sequence step</label>
            <select value={form.sequenceStep} onChange={(e) => setForm((f) => ({ ...f, sequenceStep: e.target.value }))}>
              {STEPS.map((s) => <option key={s} value={s}>{s.replace(" sent", "")}</option>)}
            </select>
          </div>
        </div>

        <div className="field-grid full">
          <div className="field">
            <label>Message body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="I'd value your view on..."
              style={{ minHeight: 110 }}
            />
            <div className={`word-count ${overLimit ? "over" : ""}`}>
              {wordCount} / {WORD_LIMIT} words{overLimit ? " — over the brief's limit" : ""}
            </div>
          </div>
        </div>

        {error && <div className="section-note" style={{ borderColor: "var(--rust)" }}>{error}</div>}

        <div className="drawer-actions" style={{ borderTop: "none", paddingTop: 0, marginTop: 4 }}>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>Cancel edit</button>
          )}
          <button type="submit" className="btn-primary" style={{ marginLeft: editingId ? 0 : "auto" }}>
            {editingId ? "Save template" : "Add template"}
          </button>
        </div>
      </form>

      <div className="template-list">
        {templates.length === 0 && (
          <div className="empty-state">No message templates yet — add version A above.</div>
        )}
        {templates.map((t) => (
          <div className="template-card" key={t._id}>
            <div className="template-card-head">
              <span className="status-tag status-Contacted">V{t.version}</span>
              <span className="template-meta">{t.channel} · {t.sequenceStep.replace(" sent", "")}</span>
              <span className="template-meta">{t.wordCount} words</span>
              <div className="row-actions" style={{ marginLeft: "auto" }}>
                <button className="icon-btn" onClick={() => startEdit(t)} title="Edit">✎</button>
                <button
                  className="icon-btn"
                  title="Delete"
                  onClick={() => window.confirm("Delete this template?") && onDelete(t._id)}
                >
                  ×
                </button>
              </div>
            </div>
            <p className="template-body">{t.body}</p>
            {t.flaggedWords?.length > 0 && (
              <div className="section-note" style={{ borderColor: "var(--rust)", marginTop: 8 }}>
                Contains flagged word(s): {t.flaggedWords.join(", ")} — the brief says never mention
                a product, a demo, or pricing.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
