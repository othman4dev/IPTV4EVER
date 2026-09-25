import { useCallback, useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/announcements.css";
import "../../assets/css/admin/hero-section.css";
import {
  createHeroEntry,
  deleteHeroEntry,
  getHeroEntries,
  updateHeroEntry,
  type CreateHeroSectionPayload,
  type HeroMediaType,
  type HeroSectionEntry,
} from "../../services/heroService";
import { getFileUrl, uploadFile } from "../../services/uploadService";
import { ImageCropModal } from "./ImageCropModal";

type ToastState = { message: string; type: "success" | "error" } | null;
type HeroFormErrors = Partial<Record<keyof CreateHeroSectionPayload, string>>;

function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return { toast, show };
}

function emptyForm(): CreateHeroSectionPayload {
  return {
    titleLine1Prefix: "Premium",
    titleLine1Highlight: "IPTV",
    titleLine1Suffix: "at",
    titleLine2Prefix: "the",
    titleLine2Highlight: "Best",
    titleLine2Suffix: "Prices",
    subtitle: "Unbeatable Deals on the Ultimate IPTV Experience",
    primaryButtonText: "Get Started",
    primaryButtonLink: "/plans",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/contact",
    mediaType: "image",
    mediaPath: "",
    order: 1,
    isActive: true,
    heroStyle: "minimalistic",
    textMode: "difference",
    textColor: "#ffffff",
  };
}

const PAGE_SIZE = 8;

const isValidLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const AdminHeroSection = () => {
  const [entries, setEntries] = useState<HeroSectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof HeroSectionEntry>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<HeroSectionEntry | null>(null);
  const [deletingItem, setDeletingItem] = useState<HeroSectionEntry | null>(null);
  const [form, setForm] = useState<CreateHeroSectionPayload>(emptyForm());
  const [formErrors, setFormErrors] = useState<HeroFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Crop modal state (images only — videos upload as-is)
  const [cropFile, setCropFile] = useState<File | null>(null);

  const { toast, show: showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHeroEntries();
      setEntries(data);
    } catch {
      showToast("Failed to load hero entries", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = entries
    .filter((item) =>
      [
        item.titleLine1Prefix,
        item.titleLine1Highlight,
        item.titleLine1Suffix,
        item.titleLine2Prefix,
        item.titleLine2Highlight,
        item.titleLine2Suffix,
        item.subtitle,
        item.primaryButtonText,
        item.secondaryButtonText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: keyof HeroSectionEntry) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const sortIcon = (key: keyof HeroSectionEntry) => {
    if (key !== sortKey) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    return sortDir === "asc" ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />;
  };

  const validateForm = (payload: CreateHeroSectionPayload) => {
    const nextErrors: HeroFormErrors = {};

    const requiredStringFields: Array<keyof CreateHeroSectionPayload> = [
      "titleLine1Prefix",
      "titleLine1Highlight",
      "titleLine1Suffix",
      "titleLine2Prefix",
      "titleLine2Highlight",
      "titleLine2Suffix",
      "subtitle",
      "primaryButtonText",
      "secondaryButtonText",
      "mediaPath",
    ];

    for (const field of requiredStringFields) {
      const value = payload[field];
      if (typeof value !== "string" || !value.trim()) {
        nextErrors[field] = "This field is required";
      }
    }

    if (!isValidLink(payload.primaryButtonLink)) {
      nextErrors.primaryButtonLink = "Use /path or http(s) URL";
    }

    if (!isValidLink(payload.secondaryButtonLink)) {
      nextErrors.secondaryButtonLink = "Use /path or http(s) URL";
    }

    if (!payload.order || payload.order < 1) {
      nextErrors.order = "Order must be 1 or greater";
    }

    if (!["image", "video"].includes(payload.mediaType)) {
      nextErrors.mediaType = "Media type must be image or video";
    }

    setFormErrors(nextErrors);
    return nextErrors;
  };

  const openCreate = () => {
    setForm({ ...emptyForm(), order: entries.length + 1 });
    setFormErrors({});
    setCreateOpen(true);
  };

  const openEdit = (entry: HeroSectionEntry) => {
    setEditItem(entry);
    setForm({
      titleLine1Prefix: entry.titleLine1Prefix,
      titleLine1Highlight: entry.titleLine1Highlight,
      titleLine1Suffix: entry.titleLine1Suffix,
      titleLine2Prefix: entry.titleLine2Prefix,
      titleLine2Highlight: entry.titleLine2Highlight,
      titleLine2Suffix: entry.titleLine2Suffix,
      subtitle: entry.subtitle,
      primaryButtonText: entry.primaryButtonText,
      primaryButtonLink: entry.primaryButtonLink,
      secondaryButtonText: entry.secondaryButtonText,
      secondaryButtonLink: entry.secondaryButtonLink,
      mediaType: entry.mediaType,
      mediaPath: entry.mediaPath,
      order: entry.order,
      isActive: entry.isActive,
      heroStyle: entry.heroStyle ?? "minimalistic",
      textMode: entry.textMode ?? "difference",
      textColor: entry.textColor ?? "#ffffff",
    });
    setFormErrors({});
  };

  const setField = <K extends keyof CreateHeroSectionPayload>(
    key: K,
    value: CreateHeroSectionPayload[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFormErrors((e) => ({ ...e, [key]: undefined }));
  };

  const uploadMedia = async (file: File, type: HeroMediaType) => {
    setUploading(true);
    try {
      const uploaded = await uploadFile(file, type === "video" ? "video" : "image");
      setField("mediaPath", uploaded.path);
    } catch {
      showToast("Failed to upload media", "error");
    } finally {
      setUploading(false);
    }
  };

  const normalizePayload = (payload: CreateHeroSectionPayload): CreateHeroSectionPayload => ({
    ...payload,
    titleLine1Prefix: payload.titleLine1Prefix.trim(),
    titleLine1Highlight: payload.titleLine1Highlight.trim(),
    titleLine1Suffix: payload.titleLine1Suffix.trim(),
    titleLine2Prefix: payload.titleLine2Prefix.trim(),
    titleLine2Highlight: payload.titleLine2Highlight.trim(),
    titleLine2Suffix: payload.titleLine2Suffix.trim(),
    subtitle: payload.subtitle.trim(),
    primaryButtonText: payload.primaryButtonText.trim(),
    primaryButtonLink: payload.primaryButtonLink.trim(),
    secondaryButtonText: payload.secondaryButtonText.trim(),
    secondaryButtonLink: payload.secondaryButtonLink.trim(),
    mediaPath: payload.mediaPath.trim(),
  });

  const handleCreate = async () => {
    const normalized = normalizePayload(form);
    const errors = validateForm(normalized);
    if (Object.keys(errors).length) {
      showToast("Please fix the form errors", "error");
      return;
    }

    setSubmitting(true);
    try {
      await createHeroEntry(normalized);
      setCreateOpen(false);
      await load();
      showToast("Hero entry created", "success");
    } catch {
      showToast("Failed to create hero entry", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;

    const normalized = normalizePayload(form);
    const errors = validateForm(normalized);
    if (Object.keys(errors).length) {
      showToast("Please fix the form errors", "error");
      return;
    }

    setSubmitting(true);
    try {
      await updateHeroEntry(editItem.id, normalized);
      setEditItem(null);
      await load();
      showToast("Hero entry updated", "success");
    } catch {
      showToast("Failed to update hero entry", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setSubmitting(true);
    try {
      await deleteHeroEntry(deletingItem.id);
      setDeletingItem(null);
      await load();
      showToast("Hero entry deleted", "success");
    } catch {
      showToast("Failed to delete hero entry", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Images → crop modal first; videos → upload as-is
  const handleFileSelected = (file: File, type: HeroMediaType): Promise<void> => {
    if (type === "video") {
      return uploadMedia(file, "video");
    }
    setCropFile(file);
    return Promise.resolve();
  };

  const handleCropDone = async (croppedFile: File) => {
    setCropFile(null);
    await uploadMedia(croppedFile, "image");
  };

  const formView = (
    <HeroForm
      form={form}
      formErrors={formErrors}
      uploading={uploading}
      onFieldChange={setField}
      onUpload={handleFileSelected}
    />
  );

  return (
    <div className="admin-plans admin-announcements">
      <div className="admin-plans-header">
        <h1>
          Hero Section
          <span>{entries.length} total</span>
        </h1>
        <button className="btn-primary-admin" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Hero Entry
        </button>
      </div>

      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search hero entries..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <table className="plans-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("order")}>Order {sortIcon("order")}</th>
              <th>Title</th>
              <th onClick={() => handleSort("mediaType")}>Media {sortIcon("mediaType")}</th>
              <th onClick={() => handleSort("isActive")}>Status {sortIcon("isActive")}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j}><div className="skeleton-cell" /></td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="table-empty">
                    <i className="bi bi-layout-text-window-reverse" />
                    {search ? "No hero entries match your search." : "No hero entries yet. Create one!"}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id}>
                  <td><span className="order-badge">{item.order}</span></td>
                  <td className="hero-title-cell">
                    <strong>
                      {item.titleLine1Prefix} {item.titleLine1Highlight} {item.titleLine1Suffix}
                    </strong>
                    <p>
                      {item.titleLine2Prefix} {item.titleLine2Highlight} {item.titleLine2Suffix}
                    </p>
                  </td>
                  <td>
                    <span className={`hero-media-badge ${item.mediaType}`}>
                      <i className={`bi ${item.mediaType === "video" ? "bi-camera-reels" : "bi-image"}`} />
                      {item.mediaType}
                    </span>
                  </td>
                  <td>
                    <span className={`ann-status-badge ${item.isActive ? "ann-active" : "ann-inactive"}`}>
                      <i className={`bi ${item.isActive ? "bi-eye" : "bi-eye-slash"}`} />
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-icon-edit" title="Edit" onClick={() => openEdit(item)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn-icon btn-icon-delete" title="Delete" onClick={() => setDeletingItem(item)}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="table-pagination">
            <span>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-buttons">
              <button className="btn-page" disabled={page === 1} onClick={() => setPage(1)}>
                <i className="bi bi-chevron-double-left" />
              </button>
              <button className="btn-page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <i className="bi bi-chevron-left" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn-page${page === i + 1 ? " active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <i className="bi bi-chevron-right" />
              </button>
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(totalPages)}>
                <i className="bi bi-chevron-double-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {createOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}>
          <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h2><i className="bi bi-layout-text-window-reverse" /> New Hero Entry</h2>
              <button className="modal-close" onClick={() => setCreateOpen(false)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">{formView}</div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreate} disabled={submitting || uploading}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Create</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h2><i className="bi bi-pencil" /> Edit Hero Entry</h2>
              <button className="modal-close" onClick={() => setEditItem(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body">{formView}</div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn-save" onClick={handleUpdate} disabled={submitting || uploading}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingItem && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setDeletingItem(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="bi bi-trash" /> Delete Hero Entry</h2>
              <button className="modal-close" onClick={() => setDeletingItem(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="delete-modal-body">
              <div className="delete-icon"><i className="bi bi-exclamation-triangle" /></div>
              <h3>Delete this hero entry?</h3>
              <p>
                "<strong>{deletingItem.titleLine1Prefix} {deletingItem.titleLine1Highlight} {deletingItem.titleLine1Suffix}</strong>"
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

      {/* Image crop modal (videos upload as-is) */}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onDone={handleCropDone}
          onCancel={() => setCropFile(null)}
        />
      )}

      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-exclamation-circle"}`} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

const HeroForm = ({
  form,
  formErrors,
  uploading,
  onFieldChange,
  onUpload,
}: {
  form: CreateHeroSectionPayload;
  formErrors: HeroFormErrors;
  uploading: boolean;
  onFieldChange: <K extends keyof CreateHeroSectionPayload>(key: K, value: CreateHeroSectionPayload[K]) => void;
  onUpload: (file: File, type: HeroMediaType) => Promise<void>;
}) => {
  return (
    <div className="hero-section-form">
      <div className="hero-helper-note">
        <i className="bi bi-info-circle" />
        <span>
          You can manage multiple hero entries. The active one with the lowest order appears first on home.
        </span>
      </div>

      <div className="hero-field-grid">
        <div className="form-group">
          <label>Line 1 Prefix *</label>
          <input className="form-control" value={form.titleLine1Prefix} onChange={(e) => onFieldChange("titleLine1Prefix", e.target.value)} />
          {formErrors.titleLine1Prefix && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.titleLine1Prefix}</p>}
        </div>
        <div className="form-group">
          <label>Line 1 Highlight *</label>
          <input className="form-control" value={form.titleLine1Highlight} onChange={(e) => onFieldChange("titleLine1Highlight", e.target.value)} />
          {formErrors.titleLine1Highlight && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.titleLine1Highlight}</p>}
        </div>
        <div className="form-group">
          <label>Line 1 Suffix *</label>
          <input className="form-control" value={form.titleLine1Suffix} onChange={(e) => onFieldChange("titleLine1Suffix", e.target.value)} />
          {formErrors.titleLine1Suffix && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.titleLine1Suffix}</p>}
        </div>
      </div>

      <div className="hero-field-grid">
        <div className="form-group">
          <label>Line 2 Prefix *</label>
          <input className="form-control" value={form.titleLine2Prefix} onChange={(e) => onFieldChange("titleLine2Prefix", e.target.value)} />
          {formErrors.titleLine2Prefix && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.titleLine2Prefix}</p>}
        </div>
        <div className="form-group">
          <label>Line 2 Highlight *</label>
          <input className="form-control" value={form.titleLine2Highlight} onChange={(e) => onFieldChange("titleLine2Highlight", e.target.value)} />
          {formErrors.titleLine2Highlight && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.titleLine2Highlight}</p>}
        </div>
        <div className="form-group">
          <label>Line 2 Suffix *</label>
          <input className="form-control" value={form.titleLine2Suffix} onChange={(e) => onFieldChange("titleLine2Suffix", e.target.value)} />
          {formErrors.titleLine2Suffix && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.titleLine2Suffix}</p>}
        </div>
      </div>

      <div className="form-group full-width">
        <label>Subtitle *</label>
        <textarea className="form-control" rows={2} value={form.subtitle} onChange={(e) => onFieldChange("subtitle", e.target.value)} />
        {formErrors.subtitle && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.subtitle}</p>}
      </div>

      <div className="hero-field-grid">
        <div className="form-group">
          <label>Primary Button Text *</label>
          <input className="form-control" value={form.primaryButtonText} onChange={(e) => onFieldChange("primaryButtonText", e.target.value)} />
          {formErrors.primaryButtonText && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.primaryButtonText}</p>}
        </div>
        <div className="form-group">
          <label>Primary Button Link *</label>
          <input className="form-control" value={form.primaryButtonLink} onChange={(e) => onFieldChange("primaryButtonLink", e.target.value)} placeholder="/plans or https://example.com" />
          {formErrors.primaryButtonLink && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.primaryButtonLink}</p>}
        </div>
      </div>

      <div className="hero-field-grid">
        <div className="form-group">
          <label>Secondary Button Text *</label>
          <input className="form-control" value={form.secondaryButtonText} onChange={(e) => onFieldChange("secondaryButtonText", e.target.value)} />
          {formErrors.secondaryButtonText && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.secondaryButtonText}</p>}
        </div>
        <div className="form-group">
          <label>Secondary Button Link *</label>
          <input className="form-control" value={form.secondaryButtonLink} onChange={(e) => onFieldChange("secondaryButtonLink", e.target.value)} placeholder="/contact or https://example.com" />
          {formErrors.secondaryButtonLink && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.secondaryButtonLink}</p>}
        </div>
      </div>

      <div className="hero-media-controls">
        <div className="form-group">
          <label>Media Type *</label>
          <select className="form-control" value={form.mediaType} onChange={(e) => onFieldChange("mediaType", e.target.value as HeroMediaType)}>
            <option value="image">Image</option>
            <option value="video">Video (looped autoplay)</option>
          </select>
          {formErrors.mediaType && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.mediaType}</p>}
        </div>
        <div className="form-group">
          <label>{form.mediaType === "video" ? "Background Video" : "Background Image"} *</label>
          <input
            type="file"
            className="form-control"
            accept={form.mediaType === "video" ? "video/*" : "image/*"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file, form.mediaType);
            }}
            disabled={uploading}
          />
          {uploading && <p className="ann-hint" style={{ color: "#0891b2" }}>Uploading media...</p>}
          {formErrors.mediaPath && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.mediaPath}</p>}
        </div>
      </div>

      <div className="hero-media-preview">
        {!form.mediaPath ? (
          <div className="hero-media-empty"><i className="bi bi-image" /> No media selected</div>
        ) : form.mediaType === "image" ? (
          <img src={getFileUrl(form.mediaPath)} alt="Hero preview" />
        ) : (
          <video src={getFileUrl(form.mediaPath)} muted autoPlay loop playsInline />
        )}
      </div>

      <div className="hero-field-grid">
        <div className="form-group">
          <label>Order *</label>
          <input
            type="number"
            min={1}
            className="form-control"
            value={form.order ?? 1}
            onChange={(e) => onFieldChange("order", Math.max(1, parseInt(e.target.value, 10) || 1))}
          />
          {formErrors.order && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.order}</p>}
        </div>

        <div className="form-group">
          <label>Visibility</label>
          <div className="ann-toggle-row">
            <label className="ann-toggle">
              <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => onFieldChange("isActive", e.target.checked)} />
              <span className="ann-toggle-track"><span className="ann-toggle-thumb" /></span>
              <span className="ann-toggle-label">{form.isActive ? "Active (visible)" : "Inactive"}</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Style & appearance (shown per hero style) ───────────────── */}
      <div className="hero-field-grid">
        <div className="form-group">
          <label>Hero Style</label>
          <select
            className="form-control"
            value={form.heroStyle ?? "minimalistic"}
            onChange={(e) => onFieldChange("heroStyle", e.target.value)}
          >
            <option value="minimalistic">Minimalistic</option>
          </select>
        </div>
      </div>

      {/* Settings specific to the minimalistic style */}
      {(form.heroStyle ?? "minimalistic") === "minimalistic" && (
        <div className="hero-field-grid">
          <div className="form-group">
            <label>Title Text Mode</label>
            <select
              className="form-control"
              value={form.textMode ?? "difference"}
              onChange={(e) => onFieldChange("textMode", e.target.value as "difference" | "solid")}
            >
              <option value="difference">Difference blend</option>
              <option value="solid">Solid colour</option>
            </select>
          </div>
          {(form.textMode ?? "difference") === "solid" && (
            <div className="form-group">
              <label>Text Colour</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={form.textColor ?? "#ffffff"}
                  onChange={(e) => onFieldChange("textColor", e.target.value)}
                />
                <input
                  type="text"
                  value={(form.textColor ?? "#ffffff").toUpperCase()}
                  onChange={(e) => onFieldChange("textColor", e.target.value)}
                  maxLength={7}
                />
                <button
                  type="button"
                  className="color-reset-btn"
                  onClick={() => onFieldChange("textColor", "#ffffff")}
                  title="Reset to white"
                >
                  <i className="bi bi-arrow-counterclockwise" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHeroSection;
