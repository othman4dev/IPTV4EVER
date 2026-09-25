import { useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/announcements.css";
import "../../assets/css/admin/slides.css";
import {
  createSlide,
  deleteSlide,
  getSlides,
  updateSlide,
  type Slide,
  type CreateSlidePayload,
} from "../../services/slideService";
import { uploadFile, getFileUrl } from "../../services/uploadService";
import { ImageCropModal } from "./ImageCropModal";

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

function emptyForm(): CreateSlidePayload {
  return {
    title: "",
    subtitle: "",
    description: "",
    icon: "bi-star",
    background: "#FF3B3B",
    textColor: "#FFFFFF",
    backgroundDim: 30,
    hasTextBorder: false,
    textBorderColor: "#000000",
    bgImage: "",
    order: 1,
    isActive: true,
  };
}

const PAGE_SIZE = 8;

// ─── Color preview ────────────────────────────────────────────────────────────
const ColorPreview = ({ color }: { color: string }) => (
  <div
    className="slide-color-preview"
    style={{ backgroundColor: color || "#FF3B3B" }}
  />
);

// ─── Main component ───────────────────────────────────────────────────────────
const AdminSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Slide>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Slide | null>(null);
  const [deletingItem, setDeletingItem] = useState<Slide | null>(null);
  const [form, setForm] = useState<CreateSlidePayload>(emptyForm());
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await getSlides();
      setSlides(data);
    } catch {
      showToast("Failed to load slides", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────
  const filtered = slides
    .filter((s) =>
      [s.title, s.subtitle, s.description, s.icon]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = (av ?? "") < (bv ?? "") ? -1 : (av ?? "") > (bv ?? "") ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: keyof Slide) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIcon = (key: keyof Slide) => {
    if (key !== sortKey)
      return (
        <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />
      );
    return sortDir === "asc" ? (
      <i className="bi bi-chevron-up" />
    ) : (
      <i className="bi bi-chevron-down" />
    );
  };

  // ── Create ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ ...emptyForm(), order: slides.length + 1 });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title?.trim()) {
      showToast("Title is required", "error");
      return;
    }
    if (!form.subtitle?.trim()) {
      showToast("Subtitle is required", "error");
      return;
    }
    if (!form.description?.trim()) {
      showToast("Description is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createSlide(form);
      setCreateOpen(false);
      await load();
      showToast("Slide created", "success");
    } catch {
      showToast("Failed to create slide", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (item: Slide) => {
    setEditItem(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      icon: item.icon,
      background: item.background,
      textColor: item.textColor,
      backgroundDim: item.backgroundDim,
      hasTextBorder: item.hasTextBorder,
      textBorderColor: item.textBorderColor,
      bgImage: item.bgImage,
      order: item.order,
      isActive: item.isActive,
    });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    if (!form.title?.trim()) {
      showToast("Title is required", "error");
      return;
    }
    if (!form.subtitle?.trim()) {
      showToast("Subtitle is required", "error");
      return;
    }
    if (!form.description?.trim()) {
      showToast("Description is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      await updateSlide(editItem.id, form);
      setEditItem(null);
      await load();
      showToast("Slide updated", "success");
    } catch {
      showToast("Failed to update slide", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await deleteSlide(deletingItem.id);
      setDeletingItem(null);
      await load();
      showToast("Slide deleted", "success");
    } catch {
      showToast("Failed to delete slide", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Form field helper ─────────────────────────────────────────────
  const setField = (key: keyof CreateSlidePayload, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="admin-plans admin-announcements">
      <div className="admin-plans-header">
        <h1>
          Slides
          <span>{slides.length} total</span>
        </h1>
        <button className="btn-primary-admin" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Slide
        </button>
      </div>

      {/* Table */}
      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search slides..."
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
              <th onClick={() => handleSort("order")}>
                Order {sortIcon("order")}
              </th>
              <th onClick={() => handleSort("title")}>
                Title {sortIcon("title")}
              </th>
              <th>BG Image</th>
              <th>Background</th>
              <th>Text Color</th>
              <th onClick={() => handleSort("isActive")}>
                Status {sortIcon("isActive")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}>
                      <div className="skeleton-cell" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="table-empty">
                    <i className="bi bi-images" />
                    {search
                      ? "No slides match your search."
                      : "No slides yet. Create one!"}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="order-badge">{item.order}</span>
                  </td>
                  <td className="slide-title-cell">
                    <div>
                      <strong>{item.title}</strong>
                      <p style={{ fontSize: "0.85em", color: "#999", margin: "4px 0 0 0" }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </td>
                  <td> 
                    <div style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: item.background,
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}>
                        {item.bgImage && (
                          <div
                            style={{
                                backgroundImage: `url(http://localhost:5001/uploads/${item.bgImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                width: "100%",
                                height: "40px"
                            }}
                        ></div>
                        )}
                    </div>
                  </td>
                  <td>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: "180px"
                    }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          backgroundColor: item.background,
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          flexShrink: 0
                        }}
                      />
                      <code style={{ fontSize: "0.8em", color: "#666" }}>{item.background}</code>
                    </div>
                  </td>
                  <td>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      minWidth: "180px"
                    }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          backgroundColor: item.textColor,
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          flexShrink: 0
                        }}
                      />
                      <code style={{ fontSize: "0.8em", color: "#666" }}>{item.textColor}</code>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`ann-status-badge ${
                        item.isActive ? "ann-active" : "ann-inactive"
                      }`}
                    >
                      <i
                        className={`bi ${
                          item.isActive ? "bi-eye" : "bi-eye-slash"
                        }`}
                      />
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
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="table-pagination">
            <span>
              Showing{" "}
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-buttons">
              <button
                className="btn-page"
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <i className="bi bi-chevron-double-left" />
              </button>
              <button
                className="btn-page"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
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
              <button
                className="btn-page"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <i className="bi bi-chevron-right" />
              </button>
              <button
                className="btn-page"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <i className="bi bi-chevron-double-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {createOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
        >
          <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h2>
                <i className="bi bi-images" /> New Slide
              </h2>
              <button
                className="modal-close"
                onClick={() => setCreateOpen(false)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <SlideForm form={form} setField={setField} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleCreate} disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="bi bi-hourglass-split" /> Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" /> Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editItem && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditItem(null);
          }}
        >
          <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h2>
                <i className="bi bi-pencil" /> Edit Slide
              </h2>
              <button className="modal-close" onClick={() => setEditItem(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <SlideForm form={form} setField={setField} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleUpdate} disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="bi bi-hourglass-split" /> Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deletingItem && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeletingItem(null);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2>
                <i className="bi bi-trash" /> Delete Slide
              </h2>
              <button
                className="modal-close"
                onClick={() => setDeletingItem(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="delete-modal-body">
              <div className="delete-icon">
                <i className="bi bi-exclamation-triangle" />
              </div>
              <h3>Delete this slide?</h3>
              <p>
                "<strong>{deletingItem.title}</strong>"
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="bi bi-hourglass-split" /> Deleting…
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          <i
            className={`bi ${
              toast.type === "success"
                ? "bi-check-circle"
                : "bi-exclamation-circle"
            }`}
          />
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ─── Form subcomponent ────────────────────────────────────────────────────────
const SlideForm = ({
  form,
  setField,
}: {
  form: CreateSlidePayload;
  setField: (key: keyof CreateSlidePayload, value: any) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadFile(file, "image");
      setField("bgImage", result.path);
    } catch (error: any) {
      setUploadError(
        error.response?.data?.message ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
  };

  return (
    <div className="slide-form">
      {/* Image crop modal */}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onDone={(croppedFile) => {
            setCropFile(null);
            doUpload(croppedFile);
          }}
          onCancel={() => setCropFile(null)}
        />
      )}
      {/* Title */}
      <div className="form-group full-width">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          value={form.title || ""}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Premium IPTV"
        />
      </div>

      {/* Subtitle */}
      <div className="form-group full-width">
        <label>Subtitle</label>
        <input
          type="text"
          className="form-control"
          value={form.subtitle || ""}
          onChange={(e) => setField("subtitle", e.target.value)}
          placeholder="Unlimited Entertainment"
        />
      </div>

      {/* Description */}
      <div className="form-group full-width">
        <label>Description</label>
        <textarea
          className="form-control"
          rows={3}
          value={form.description || ""}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Access 10,000+ channels from around the world in stunning 4K quality"
        />
      </div>

      {/* Icon */}
      <div className="form-group full-width">
        <label>Bootstrap Icon Class</label>
        <div className="slide-icon-input-wrapper">
          <input
            type="text"
            className="form-control"
            value={form.icon || ""}
            onChange={(e) => setField("icon", e.target.value)}
            placeholder="bi-tv"
          />
          <div className="slide-icon-preview-box">
            <i className={`bi ${form.icon || "bi-question"}`} style={{ fontSize: "2rem" }}></i>
          </div>
        </div>
        <p className="ann-hint">
          Use Bootstrap icon classes like <code>bi-tv</code>, <code>bi-trophy</code>, <code>bi-film</code>, <code>bi-phone</code>.
          Browse icons at{" "}
          <a href="https://icons.getbootstrap.com" target="_blank" rel="noreferrer">
            icons.getbootstrap.com
          </a>
          .
        </p>
      </div>

      {/* Background Color */}
      <div className="form-group full-width">
        <label>Background Color</label>
        <div className="slide-color-input-wrapper">
          <input
            type="color"
            className="form-control slide-color-picker"
            value={form.background || "#FF3B3B"}
            onChange={(e) => setField("background", e.target.value)}
          />
          <input
            type="text"
            className="form-control slide-color-text"
            value={form.background || "#FF3B3B"}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-F]{6}$/i.test(val) || val === "") {
                setField("background", val);
              }
            }}
            placeholder="#FF3B3B"
            pattern="^#[0-9A-F]{6}$"
          />
        </div>
        {form.background && !/^#[0-9A-F]{6}$/i.test(form.background) && (
          <p className="ann-hint" style={{ color: "#dc2626" }}>
            <i className="bi bi-exclamation-circle" /> Invalid hex color format (use #RRGGBB)
          </p>
        )}
      </div>

      {/* Background Image */}
      <div className="form-group full-width">
        <label>Background Image (Optional)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="form-control"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploadError && (
          <p className="ann-hint" style={{ color: "#dc2626" }}>
            <i className="bi bi-exclamation-circle" /> {uploadError}
          </p>
        )}
        {uploading && (
          <p className="ann-hint" style={{ color: "#0891b2" }}>
            <i className="bi bi-hourglass-split" /> Uploading...
          </p>
        )}
        {form.bgImage && !uploading && (
          <div className="slide-preview-box">
            <img 
              src={getFileUrl(form.bgImage)} 
              alt="Preview" 
              className="slide-preview-img"
            />
            <div 
              className="slide-preview-overlay"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${(form.backgroundDim ?? 30) / 100})`
              }}
            />
            <button
              type="button"
              className="btn-remove-image"
              onClick={() => setField("bgImage", "")}
              title="Remove image"
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        )}
        <p className="ann-hint">
          Upload a JPG, PNG, GIF, or WebP image. Max 10 MB.
        </p>
      </div>

      {/* Text Color */}
      <div className="form-group full-width">
        <label>Text Color</label>
        <div className="slide-color-input-wrapper">
          <input
            type="color"
            className="form-control slide-color-picker"
            value={form.textColor || "#FFFFFF"}
            onChange={(e) => setField("textColor", e.target.value)}
          />
          <input
            type="text"
            className="form-control slide-color-text"
            value={form.textColor || "#FFFFFF"}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-F]{6}$/i.test(val) || val === "") {
                setField("textColor", val);
              }
            }}
            placeholder="#FFFFFF"
            pattern="^#[0-9A-F]{6}$"
          />
        </div>
        {form.textColor && !/^#[0-9A-F]{6}$/i.test(form.textColor) && (
          <p className="ann-hint" style={{ color: "#dc2626" }}>
            <i className="bi bi-exclamation-circle" /> Invalid hex color format (use #RRGGBB)
          </p>
        )}
      </div>

      {/* Background Dim */}
      <div className="form-group full-width">
        <label>Background Dim (Overlay Opacity)</label>
        <div className="slide-dim-control">
          <input
            type="range"
            className="dim-slider"
            min="0"
            max="100"
            value={form.backgroundDim ?? 30}
            onChange={(e) => setField("backgroundDim", parseInt(e.target.value))}
          />
          <span className="dim-value">{form.backgroundDim ?? 30}%</span>
        </div>
        <p className="ann-hint">
          Control how dark the overlay appears. 0% = transparent, 100% = fully opaque.
        </p>
      </div>

      {/* Text Border */}
      <div className="form-group full-width">
        <label>Text Border</label>
        <div className="slide-toggle-row">
          <label className="slide-toggle">
            <input
              type="checkbox"
              checked={form.hasTextBorder ?? false}
              onChange={(e) => setField("hasTextBorder", e.target.checked)}
            />
            <span className="slide-toggle-track">
              <span className="slide-toggle-thumb" />
            </span>
            <span className="slide-toggle-label">
              {form.hasTextBorder ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>
      </div>

      {/* Text Border Color */}
      {form.hasTextBorder && (
        <div className="form-group full-width">
          <label>Text Border Color</label>
          <div className="slide-color-input-wrapper">
            <input
              type="color"
              className="form-control slide-color-picker"
              value={form.textBorderColor || "#000000"}
              onChange={(e) => setField("textBorderColor", e.target.value)}
            />
            <input
              type="text"
              className="form-control slide-color-text"
              value={form.textBorderColor || "#000000"}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(val) || val === "") {
                  setField("textBorderColor", val);
                }
              }}
              placeholder="#000000"
              pattern="^#[0-9A-F]{6}$"
            />
          </div>
          {form.textBorderColor && !/^#[0-9A-F]{6}$/i.test(form.textBorderColor) && (
            <p className="ann-hint" style={{ color: "#dc2626" }}>
              <i className="bi bi-exclamation-circle" /> Invalid hex color format (use #RRGGBB)
            </p>
          )}
        </div>
      )}

      {/* Order + Status */}
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
          <div className="slide-toggle-row">
            <label className="slide-toggle">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              <span className="slide-toggle-track">
                <span className="slide-toggle-thumb" />
              </span>
              <span className="slide-toggle-label">
                {form.isActive ? "Active (visible)" : "Hidden"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSlides;
