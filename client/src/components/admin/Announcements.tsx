import { useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/announcements.css";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  type Announcement,
  type CreateAnnouncementPayload,
} from "../../services/announcementService";
import {
  getSectionConfig,
  patchSectionConfig,
  getHomeSections,
} from "../../services/pageLayoutService";

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastState = { message: string; type: "success" | "error" } | null;

function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (message: string, type: "success" | "error" = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 3200);
  };
  return { toast, show };
}

function emptyForm(): CreateAnnouncementPayload {
  return { icon: '<i class="bi bi-megaphone"></i>', text: "", order: 1, isActive: true };
}

const PAGE_SIZE = 8;

// ─── Icon preview ─────────────────────────────────────────────────────────────
const IconPreview = ({ html }: { html: string }) => (
  <span
    className="announcement-icon-preview"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

// ─── Main component ───────────────────────────────────────────────────────────
const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Announcement>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState<CreateAnnouncementPayload>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  // ── Appearance settings ───────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsBgColor, setSettingsBgColor] = useState("#1a1a1a");
  const [settingsTextColor, setSettingsTextColor] = useState("#ffffff");
  const [settingsMarginTop, setSettingsMarginTop] = useState(20);
  const [settingsMarginBottom, setSettingsMarginBottom] = useState(0);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadSettings = async () => {
    try {
      const sections = await getHomeSections();
      const ann = sections.find((s) => s.sectionKey === "announcements");
      if (ann?.config) {
        const parsed = JSON.parse(ann.config) as {
          bgColor?: string;
          textColor?: string;
          marginTop?: number;
          marginBottom?: number;
        };
        if (parsed.bgColor) setSettingsBgColor(parsed.bgColor);
        if (parsed.textColor) setSettingsTextColor(parsed.textColor);
        if (parsed.marginTop !== undefined) setSettingsMarginTop(parsed.marginTop);
        if (parsed.marginBottom !== undefined) setSettingsMarginBottom(parsed.marginBottom);
      }
    } catch {
      /* keep defaults */
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await patchSectionConfig("announcements", {
        config: JSON.stringify({
          bgColor: settingsBgColor,
          textColor: settingsTextColor,
          marginTop: settingsMarginTop,
          marginBottom: settingsMarginBottom,
        }),
      });
      setSettingsOpen(false);
      showToast("Appearance settings saved", "success");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  // ── Load ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch {
      showToast("Failed to load announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); loadSettings(); }, []);

  // ── Derived ───────────────────────────────────────────────────────
  const filtered = announcements
    .filter((a) =>
      [a.text, a.icon].join(" ").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = (av ?? "") < (bv ?? "") ? -1 : (av ?? "") > (bv ?? "") ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: keyof Announcement) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortIcon = (key: keyof Announcement) => {
    if (key !== sortKey) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    return sortDir === "asc" ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />;
  };

  // ── Create ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ ...emptyForm(), order: announcements.length + 1 });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.text.trim()) { showToast("Text is required", "error"); return; }
    setSubmitting(true);
    try {
      await createAnnouncement(form);
      setCreateOpen(false);
      await load();
      showToast("Announcement created", "success");
    } catch {
      showToast("Failed to create announcement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (item: Announcement) => {
    setEditItem(item);
    setForm({ icon: item.icon, text: item.text, order: item.order, isActive: item.isActive });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    if (!form.text?.trim()) { showToast("Text is required", "error"); return; }
    setSubmitting(true);
    try {
      await updateAnnouncement(editItem.id, form);
      setEditItem(null);
      await load();
      showToast("Announcement updated", "success");
    } catch {
      showToast("Failed to update announcement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await deleteAnnouncement(deletingItem.id);
      setDeletingItem(null);
      await load();
      showToast("Announcement deleted", "success");
    } catch {
      showToast("Failed to delete announcement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Form field helper ─────────────────────────────────────────────
  const setField = (key: keyof CreateAnnouncementPayload, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="admin-plans admin-announcements">
      <div className="admin-plans-header">
        <h1>
          Announcements
          <span>{announcements.length} total</span>
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary-admin" onClick={() => setSettingsOpen(true)}>
            <i className="bi bi-palette" /> Appearance
          </button>
          <button className="btn-primary-admin" onClick={openCreate}>
            <i className="bi bi-plus-lg" /> New Announcement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <table className="plans-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("order")}>Order {sortIcon("order")}</th>
              <th>Icon Preview</th>
              <th onClick={() => handleSort("text")}>Text {sortIcon("text")}</th>
              <th onClick={() => handleSort("isActive")}>Status {sortIcon("isActive")}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="skeleton-cell" /></td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="table-empty">
                    <i className="bi bi-megaphone" />
                    {search ? "No announcements match your search." : "No announcements yet. Create one!"}
                  </div>
                </td>
              </tr>
            ) : paginated.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="order-badge">{item.order}</span>
                </td>
                <td>
                  <span className="announcement-icon-cell">
                    <IconPreview html={item.icon} />
                    <code className="icon-html-snippet">{item.icon}</code>
                  </span>
                </td>
                <td className="announcement-text-cell">{item.text}</td>
                <td>
                  <span className={`ann-status-badge ${item.isActive ? "ann-active" : "ann-inactive"}`}>
                    <i className={`bi ${item.isActive ? "bi-eye" : "bi-eye-slash"}`} />
                    {item.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-icon-edit"
                      title="Edit"
                      onClick={() => openEdit(item)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn-icon btn-icon-delete"
                      title="Delete"
                      onClick={() => setDeletingItem(item)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="table-pagination">
            <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="pagination-buttons">
              <button className="btn-page" disabled={page === 1} onClick={() => setPage(1)}><i className="bi bi-chevron-double-left" /></button>
              <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="bi bi-chevron-left" /></button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={`btn-page${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><i className="bi bi-chevron-right" /></button>
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(totalPages)}><i className="bi bi-chevron-double-right" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {createOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="bi bi-megaphone" /> New Announcement</h2>
              <button className="modal-close" onClick={() => setCreateOpen(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <AnnouncementForm form={form} setField={setField} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreate} disabled={submitting}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Create</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditItem(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="bi bi-pencil" /> Edit Announcement</h2>
              <button className="modal-close" onClick={() => setEditItem(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <AnnouncementForm form={form} setField={setField} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn-save" onClick={handleUpdate} disabled={submitting}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deletingItem && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeletingItem(null); }}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="bi bi-trash" /> Delete Announcement</h2>
              <button className="modal-close" onClick={() => setDeletingItem(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="delete-modal-body">
              <div className="delete-icon"><i className="bi bi-exclamation-triangle" /></div>
              <h3>Delete this announcement?</h3>
              <p>
                "<strong>{deletingItem.text.slice(0, 60)}{deletingItem.text.length > 60 ? "…" : ""}</strong>"
                <br />This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeletingItem(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Deleting…</> : <><i className="bi bi-trash" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Appearance Settings Modal ── */}
      {settingsOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="bi bi-palette" /> Announcement Bar Appearance</h2>
              <button className="modal-close" onClick={() => setSettingsOpen(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">
              <div className="ann-form">
                <p className="ann-hint" style={{ marginBottom: 16 }}>
                  These colours apply to both classic and minimalistic bar styles on the public site.
                  Switch the bar style in <strong>Home Layout</strong>.
                </p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Background Colour</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={settingsBgColor}
                        onChange={(e) => setSettingsBgColor(e.target.value)}
                      />
                      <input
                        type="text"
                        value={settingsBgColor.toUpperCase()}
                        onChange={(e) => setSettingsBgColor(e.target.value)}
                        maxLength={7}
                      />
                      <button
                        type="button"
                        className="color-reset-btn"
                        onClick={() => setSettingsBgColor("#1a1a1a")}
                        title="Reset to default"
                      >
                        <i className="bi bi-arrow-counterclockwise" />
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Text Colour</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={settingsTextColor}
                        onChange={(e) => setSettingsTextColor(e.target.value)}
                      />
                      <input
                        type="text"
                        value={settingsTextColor.toUpperCase()}
                        onChange={(e) => setSettingsTextColor(e.target.value)}
                        maxLength={7}
                      />
                      <button
                        type="button"
                        className="color-reset-btn"
                        onClick={() => setSettingsTextColor("#ffffff")}
                        title="Reset to default"
                      >
                        <i className="bi bi-arrow-counterclockwise" />
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Margin Top (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={200}
                      value={settingsMarginTop}
                      onChange={(e) => setSettingsMarginTop(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Margin Bottom (px)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={200}
                      value={settingsMarginBottom}
                      onChange={(e) => setSettingsMarginBottom(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>
                {/* Live preview */}
                <div className="ann-settings-preview">
                  <span className="ann-settings-preview-label">Preview</span>
                  <div className="ann-settings-preview-bar" style={{ backgroundColor: settingsBgColor }}>
                    <span style={{ color: settingsTextColor }}>
                      <i className="bi bi-megaphone" style={{ marginRight: 8 }} />
                      Your announcement text will look like this
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSettingsOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveSettings} disabled={settingsSaving}>
                {settingsSaving ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-exclamation-circle"}`} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ─── Form subcomponent ────────────────────────────────────────────────────────
const AnnouncementForm = ({
  form,
  setField,
}: {
  form: CreateAnnouncementPayload;
  setField: (key: keyof CreateAnnouncementPayload, value: any) => void;
}) => (
  <div className="ann-form">
    {/* Icon HTML */}
    <div className="form-group full-width">
      <label>Bootstrap Icon HTML</label>
      <div className="ann-icon-field">
        <textarea
          className="form-control ann-icon-textarea"
          value={form.icon}
          onChange={(e) => setField("icon", e.target.value)}
          placeholder='<i class="bi bi-megaphone"></i>'
          rows={2}
          spellCheck={false}
        />
        <div className="ann-icon-live-preview">
          <span className="ann-preview-label">Preview</span>
          <span
            className="ann-preview-icon"
            dangerouslySetInnerHTML={{ __html: form.icon || "" }}
          />
        </div>
      </div>
      <p className="ann-hint">
        Use any Bootstrap Icon, e.g.&nbsp;
        <code>{'<i class="bi bi-speaker"></i>'}</code>&nbsp;or&nbsp;
        <code>{'<i class="bi bi-wifi"></i>'}</code>.
        Browse icons at&nbsp;
        <a href="https://icons.getbootstrap.com" target="_blank" rel="noreferrer">icons.getbootstrap.com</a>.
      </p>
    </div>

    {/* Text */}
    <div className="form-group full-width">
      <label>Announcement Text</label>
      <textarea
        className="form-control"
        rows={3}
        value={form.text}
        onChange={(e) => setField("text", e.target.value)}
        placeholder="50% OFF on Annual Subscriptions - Limited Time Offer!"
      />
    </div>

    {/* Order + Status row */}
    <div className="form-grid">
      <div className="form-group">
        <label>Order</label>
        <input
          type="number"
          className="form-control"
          min={1}
          value={form.order ?? 1}
          onChange={(e) => setField("order", parseInt(e.target.value) || 1)}
        />
      </div>
      <div className="form-group">
        <label>Visibility</label>
        <div className="ann-toggle-row">
          <label className="ann-toggle">
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setField("isActive", e.target.checked)}
            />
            <span className="ann-toggle-track">
              <span className="ann-toggle-thumb" />
            </span>
            <span className="ann-toggle-label">
              {form.isActive ? "Active (visible)" : "Hidden"}
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default AdminAnnouncements;
