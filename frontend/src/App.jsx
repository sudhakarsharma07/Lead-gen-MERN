import React, { useEffect, useState, useCallback } from "react";
import StatsPanel from "./components/StatsPanel";
import ProspectTable from "./components/ProspectTable";
import ProspectDrawer from "./components/ProspectDrawer";
import SuppressionPanel from "./components/SuppressionPanel";
import ReportsPanel from "./components/ReportsPanel";
import TemplatesPanel from "./components/TemplatesPanel";
import {
  getProspects,
  createProspect,
  updateProspect,
  deleteProspect,
  declineProspect,
  advanceSequence,
  getSuppression,
  removeSuppression,
  getStats,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "./api";

const STATUS_FILTERS = ["All", "Not contacted", "Contacted", "Replied", "Booked", "Declined"];
const WEEK_FILTERS = ["All", 1, 2, 3, 4];

export default function App() {
  const [tab, setTab] = useState("ledger"); // ledger | reports | templates | suppression
  const [prospects, setProspects] = useState([]);
  const [stats, setStats] = useState(null);
  const [suppression, setSuppression] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [weekFilter, setWeekFilter] = useState("All");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProspect, setActiveProspect] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (weekFilter !== "All") params.week = weekFilter;
      if (search) params.search = search;

      const [p, s, sup, tpl] = await Promise.all([
        getProspects(params),
        getStats(),
        getSuppression(),
        getTemplates(),
      ]);
      setProspects(p);
      setStats(s);
      setSuppression(sup);
      setTemplates(tpl);
    } catch (err) {
      setError(
        "Could not reach the API. Is the backend running on the URL in VITE_API_URL? (" +
          (err.message || "unknown error") +
          ")"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, weekFilter, search]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openNew = () => {
    setActiveProspect(null);
    setDrawerOpen(true);
  };
  const openEdit = (p) => {
    setActiveProspect(p);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const handleSave = async (payload, id) => {
    try {
      if (id) {
        await updateProspect(id, payload);
      } else {
        await createProspect(payload);
      }
      setDrawerOpen(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save this record.");
    }
  };

  const handleDelete = async (id) => {
    await deleteProspect(id);
    loadAll();
  };

  const handleDecline = async (id) => {
    const reason = window.prompt("Reason for decline / opt-out (optional):", "Opted out");
    await declineProspect(id, reason || undefined);
    setDrawerOpen(false);
    loadAll();
  };

  const handleRemoveSuppression = async (id) => {
    await removeSuppression(id);
    loadAll();
  };

  const handleAdvanceSequence = async (id, channel) => {
    try {
      const updated = await advanceSequence(id, channel);
      setActiveProspect(updated);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.error || "Could not advance the sequence.");
    }
  };

  const handleCreateTemplate = async (data) => {
    await createTemplate(data);
    loadAll();
  };
  const handleUpdateTemplate = async (id, data) => {
    await updateTemplate(id, data);
    loadAll();
  };
  const handleDeleteTemplate = async (id) => {
    await deleteTemplate(id);
    loadAll();
  };

  return (
    <div className="shell">
      <div className="masthead">
        <div>
          <div className="masthead-eyebrow">Lead generation — UK / EU property management</div>
          <h1>Prospect Ledger</h1>
          <p className="sub">
            300 companies, 20 research interviews. Research conversations only — never a
            product pitch.
          </p>
        </div>
        <div className="masthead-tabs">
          <button
            className={`tab-btn ${tab === "ledger" ? "active" : ""}`}
            onClick={() => setTab("ledger")}
          >
            Ledger
          </button>
          <button
            className={`tab-btn ${tab === "reports" ? "active" : ""}`}
            onClick={() => setTab("reports")}
          >
            Reports
          </button>
          <button
            className={`tab-btn ${tab === "templates" ? "active" : ""}`}
            onClick={() => setTab("templates")}
          >
            Templates ({templates.length})
          </button>
          <button
            className={`tab-btn ${tab === "suppression" ? "active" : ""}`}
            onClick={() => setTab("suppression")}
          >
            Suppression ({suppression.length})
          </button>
        </div>
      </div>

      {error && <div className="section-note" style={{ borderColor: "var(--rust)" }}>{error}</div>}

      <StatsPanel stats={stats} />

      {tab === "ledger" && (
        <>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search company, contact, software…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="chip-group">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  className={`chip ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="chip-group">
              {WEEK_FILTERS.map((w) => (
                <button
                  key={w}
                  className={`chip ${weekFilter === w ? "active" : ""}`}
                  onClick={() => setWeekFilter(w)}
                >
                  {w === "All" ? "All weeks" : `Wk ${w}`}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={openNew}>+ Add prospect</button>
          </div>

          {loading ? (
            <div className="empty-state">Loading ledger…</div>
          ) : (
            <ProspectTable prospects={prospects} onSelect={openEdit} onDelete={handleDelete} />
          )}
        </>
      )}

      {tab === "reports" && <ReportsPanel stats={stats} />}

      {tab === "templates" && (
        <TemplatesPanel
          templates={templates}
          onCreate={handleCreateTemplate}
          onUpdate={handleUpdateTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      {tab === "suppression" && (
        <SuppressionPanel list={suppression} onRemove={handleRemoveSuppression} />
      )}

      {drawerOpen && (
        <ProspectDrawer
          prospect={activeProspect}
          onClose={closeDrawer}
          onSave={handleSave}
          onDelete={handleDelete}
          onDecline={handleDecline}
          onAdvance={handleAdvanceSequence}
        />
      )}
    </div>
  );
}
