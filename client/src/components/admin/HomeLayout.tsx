import { useCallback, useEffect, useRef, useState } from "react";
import "../../assets/css/admin/home-layout.css";
import {
  getHomeSections,
  updateHomeSections,
  type PageSectionConfig,
} from "../../services/pageLayoutService";

type ToastState = { message: string; type: "success" | "error" } | null;

function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, type });
      timerRef.current = setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  return { toast, show };
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Main banner with title, subtitle and call-to-action buttons",
  announcements: "Scrolling ticker with latest announcements",
  intro: "Feature highlights and introductory content cards",
  slider: "Horizontal channel / logo carousel",
  testimonials: "Customer reviews and testimonials",
  pricing: "Subscription pricing plans grid",
  faq: "Frequently asked questions accordion",
  contact: "Contact form and info section",
};

// Sections that support multiple display variants
const SECTION_VARIANTS: Record<string, { value: string; label: string; icon: string }[]> = {
  hero: [
    { value: "default", label: "Classic",      icon: "bi-window-stack" },
    { value: "minimal", label: "Minimalist",   icon: "bi-layout-sidebar-inset-reverse" },
  ],
  announcements: [
    { value: "default",      label: "Classic",      icon: "bi-megaphone" },
    { value: "minimalistic", label: "Minimalistic", icon: "bi-dash" },
  ],
};

const AdminHomeLayout = () => {
  const [sections, setSections] = useState<PageSectionConfig[]>([]);
  const [savedSections, setSavedSections] = useState<PageSectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, show: showToast } = useToast();

  // Drag state
  const dragSrcRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHomeSections();
      setSections(data);
      setSavedSections(data);
    } catch {
      showToast("Failed to load layout configuration", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const hasUnsavedChanges =
    JSON.stringify(sections.map((s) => ({ k: s.sectionKey, v: s.isVisible, o: s.order, vr: s.variant }))) !==
    JSON.stringify(savedSections.map((s) => ({ k: s.sectionKey, v: s.isVisible, o: s.order, vr: s.variant })));

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  const handleDragStart = (index: number) => {
    dragSrcRef.current = index;
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragSrcRef.current === null || dragSrcRef.current === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const srcIndex = dragSrcRef.current;
    if (srcIndex === null || srcIndex === dropIndex) {
      setDragOverIndex(null);
      setDraggingIndex(null);
      dragSrcRef.current = null;
      return;
    }

    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(srcIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next.map((s, i) => ({ ...s, order: i }));
    });

    dragSrcRef.current = null;
    setDragOverIndex(null);
    setDraggingIndex(null);
  };

  const handleDragEnd = () => {
    dragSrcRef.current = null;
    setDragOverIndex(null);
    setDraggingIndex(null);
  };

  // ── Toggle visibility ──────────────────────────────────────────────────────

  const toggleVisibility = (sectionKey: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.sectionKey === sectionKey ? { ...s, isVisible: !s.isVisible } : s,
      ),
    );
  };

  // ── Set variant ────────────────────────────────────────────────────────────

  const setVariant = (sectionKey: string, variant: string) => {
    setSections((prev) =>
      prev.map((s) => (s.sectionKey === sectionKey ? { ...s, variant } : s)),
    );
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateHomeSections(
        sections.map((s, i) => ({
          sectionKey: s.sectionKey,
          isVisible: s.isVisible,
          order: i,
          variant: s.variant,
        })),
      );
      setSections(updated);
      setSavedSections(updated);
      showToast("Home page layout saved successfully");
    } catch {
      showToast("Failed to save layout", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setSections(savedSections.map((s) => ({ ...s })));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="home-layout-content">
        <div className="home-layout-loading">
          <div className="spinner-ring" />
          <span>Loading layout…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="home-layout-content">
      {/* Header */}
      <div className="home-layout-header">
        <div className="home-layout-header-left">
          <h1>
            Home Page Layout
            {hasUnsavedChanges && <span className="unsaved-dot" title="Unsaved changes" />}
          </h1>
          <p>Drag to reorder sections and toggle visibility for the public home page.</p>
        </div>
        <div className="home-layout-header-actions">
          {hasUnsavedChanges && (
            <button className="btn-reset-layout" onClick={handleReset} disabled={saving}>
              <i className="bi bi-arrow-counterclockwise" />
              Discard
            </button>
          )}
          <button
            className="btn-save-layout"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
          >
            {saving ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "hl-spin 0.6s linear infinite",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <i className="bi bi-floppy" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="home-layout-info">
        <i className="bi bi-info-circle-fill" />
        <span>
          Drag the <strong>grip handle</strong> on the left to reorder sections. Use the
          toggle on the right to show or hide each section from the public home page.
        </span>
      </div>

      {/* Draggable section list */}
      <div className="home-layout-list">
        {sections.map((section, index) => {
          const isDragging = draggingIndex === index;
          const isDragOver = dragOverIndex === index;
          const isHidden = !section.isVisible;

          return (
      <div
              key={section.sectionKey}
              className={[
                "home-layout-card-wrapper",
                isDragging ? "wrapper-dragging" : "",
                isDragOver ? "wrapper-drag-over" : "",
              ].filter(Boolean).join(" ")}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
            <div
              className={[
                "home-layout-card",
                isHidden ? "card-hidden" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Drag handle */}
              <div className="home-layout-drag-handle" title="Drag to reorder">
                <i className="bi bi-grip-vertical" />
              </div>

              {/* Order number */}
              <div className="home-layout-order">{index + 1}</div>

              {/* Icon */}
              <div className="home-layout-icon">
                <i className={`bi ${section.icon}`} />
              </div>

              {/* Info */}
              <div className="home-layout-info-text">
                <div className="home-layout-label">{section.label}</div>
                <div className="home-layout-meta">
                  {SECTION_DESCRIPTIONS[section.sectionKey] ?? section.sectionKey}
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`home-layout-status ${isHidden ? "status-hidden" : "status-visible"}`}
              >
                {isHidden ? "Hidden" : "Visible"}
              </span>

              {/* Toggle */}
              <label className="home-layout-toggle" title="Toggle visibility">
                <input
                  type="checkbox"
                  checked={section.isVisible}
                  onChange={() => toggleVisibility(section.sectionKey)}
                />
                <span className="toggle-track" />
              </label>
            </div>

            {/* Variant picker — shown only for sections with multiple variants */}
            {SECTION_VARIANTS[section.sectionKey] && (
              <div className="home-layout-variant-row">
                <span className="variant-row-label">
                  <i className="bi bi-palette2" />
                  Style
                </span>
                <div className="variant-row-options">
                  {SECTION_VARIANTS[section.sectionKey].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`variant-option-btn${section.variant === opt.value ? " selected" : ""}`}
                      onClick={() => setVariant(section.sectionKey, opt.value)}
                    >
                      <i className={`bi ${opt.icon}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`home-layout-toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
          {toast.message}
        </div>
      )}
    </main>
  );
};

export default AdminHomeLayout;
