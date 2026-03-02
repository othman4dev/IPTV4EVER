import { useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import {
  createFeature,
  createPlan,
  deleteFeature,
  deletePlan,
  getPlans,
  updateFeature,
  updatePlan,
  type CreatePlanPayload,
  type Plan,
  type PlanFeature,
} from "../../services/planService";

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

// ─── Plan form state ───────────────────────────────────────────────────────────
const emptyForm = (): CreatePlanPayload => ({
  name: "",
  pricePerMonth: 0,
  pricePer6Months: 0,
  pricePerYear: 0,
  color: "#ff3b3b",
  thumb: "",
  buttonText: "Subscribe",
  order: 1,
});

// ─── Inline feature row used inside edit modal ────────────────────────────────
interface FeatureRowProps {
  feature: PlanFeature;
  onSave: (id: number, desc: string, order: number) => Promise<void>;
  onDelete: (id: number) => void;
}

function FeatureRow({ feature, onSave, onDelete }: FeatureRowProps) {
  const [desc, setDesc] = useState(feature.description);
  const [order, setOrder] = useState(feature.order);
  const [saving, setSaving] = useState(false);
  const dirty = desc !== feature.description || order !== feature.order;

  const handleSave = async () => {
    setSaving(true);
    await onSave(feature.id, desc, order);
    setSaving(false);
  };

  return (
    <div className="feature-row">
      <input
        type="number"
        className="form-control feature-order-input"
        value={order}
        min={1}
        onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
      />
      <input
        type="text"
        className="form-control feature-desc-input"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Feature description"
      />
      {dirty && (
        <button
          className="btn-icon-sm btn-icon-edit"
          onClick={handleSave}
          disabled={saving}
          title="Save"
        >
          {saving ? <i className="bi bi-hourglass-split" /> : <i className="bi bi-check-lg" />}
        </button>
      )}
      <button
        className="btn-icon-sm btn-icon-delete"
        onClick={() => onDelete(feature.id)}
        title="Delete feature"
      >
        <i className="bi bi-trash3" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  // Search / sort / pagination
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Plan>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  // Form state (shared for create & edit)
  const [form, setForm] = useState<CreatePlanPayload>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  // New feature input inside edit modal
  const [newFeatureDesc, setNewFeatureDesc] = useState("");
  const [newFeatureOrder, setNewFeatureOrder] = useState(1);
  const [addingFeature, setAddingFeature] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      showToast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Derived data ──────────────────────────────────────────────────
  const filtered = plans
    .filter((p) =>
      [p.name, p.buttonText, p.color]
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

  const handleSort = (key: keyof Plan) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortIcon = (key: keyof Plan) => {
    if (key !== sortKey) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    return sortDir === "asc"
      ? <i className="bi bi-chevron-up" />
      : <i className="bi bi-chevron-down" />;
  };

  // ── Create ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm());
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createPlan(form);
      setCreateOpen(false);
      await load();
      showToast("Plan created successfully", "success");
    } catch {
      showToast("Failed to create plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (plan: Plan) => {
    setEditPlan({ ...plan });
    setForm({
      name: plan.name,
      pricePerMonth: plan.pricePerMonth,
      pricePer6Months: plan.pricePer6Months,
      pricePerYear: plan.pricePerYear,
      color: plan.color,
      thumb: plan.thumb ?? "",
      buttonText: plan.buttonText,
      order: plan.order,
    });
    setNewFeatureDesc("");
    setNewFeatureOrder((plan.features?.length ?? 0) + 1);
  };

  const handleUpdate = async () => {
    if (!editPlan) return;
    setSubmitting(true);
    try {
      await updatePlan(editPlan.id, form);
      setEditPlan(null);
      await load();
      showToast("Plan updated successfully", "success");
    } catch {
      showToast("Failed to update plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Feature CRUD (inside edit modal) ──────────────────────────────
  const handleSaveFeature = async (id: number, description: string, order: number) => {
    try {
      await updateFeature(id, { description, order });
      const updated = await getPlans();
      const fresh = updated.find((p) => p.id === editPlan?.id);
      if (fresh) setEditPlan(fresh);
      setPlans(updated);
      showToast("Feature updated", "success");
    } catch {
      showToast("Failed to update feature", "error");
    }
  };

  const handleDeleteFeature = async (id: number) => {
    try {
      await deleteFeature(id);
      const updated = await getPlans();
      const fresh = updated.find((p) => p.id === editPlan?.id);
      if (fresh) setEditPlan(fresh);
      setPlans(updated);
      showToast("Feature deleted", "success");
    } catch {
      showToast("Failed to delete feature", "error");
    }
  };

  const handleAddFeature = async () => {
    if (!editPlan || !newFeatureDesc.trim()) return;
    setAddingFeature(true);
    try {
      await createFeature({ planId: editPlan.id, description: newFeatureDesc.trim(), order: newFeatureOrder });
      const updated = await getPlans();
      const fresh = updated.find((p) => p.id === editPlan.id);
      if (fresh) setEditPlan(fresh);
      setPlans(updated);
      setNewFeatureDesc("");
      setNewFeatureOrder(newFeatureOrder + 1);
      showToast("Feature added", "success");
    } catch {
      showToast("Failed to add feature", "error");
    } finally {
      setAddingFeature(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingPlan) return;
    setSubmitting(true);
    try {
      await deletePlan(deletingPlan.id);
      setDeletingPlan(null);
      await load();
      showToast("Plan deleted", "success");
    } catch {
      showToast("Failed to delete plan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Form helpers ──────────────────────────────────────────────────
  const field = (key: keyof CreatePlanPayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-plans">
      {/* ── Header ── */}
      <div className="admin-plans-header">
        <h1>
          Plans
          <span>{plans.length} total</span>
        </h1>
        <button className="btn-primary-admin" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> Add Plan
        </button>
      </div>

      {/* ── Table ── */}
      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search plans..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <table className="plans-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("order")} className={sortKey === "order" ? "sorted" : ""}>
                # {sortIcon("order")}
              </th>
              <th onClick={() => handleSort("name")} className={sortKey === "name" ? "sorted" : ""}>
                Name {sortIcon("name")}
              </th>
              <th onClick={() => handleSort("color")} className={sortKey === "color" ? "sorted" : ""}>
                Color {sortIcon("color")}
              </th>
              <th onClick={() => handleSort("pricePerMonth")} className={sortKey === "pricePerMonth" ? "sorted" : ""}>
                /Month {sortIcon("pricePerMonth")}
              </th>
              <th onClick={() => handleSort("pricePer6Months")} className={sortKey === "pricePer6Months" ? "sorted" : ""}>
                /6 Mo {sortIcon("pricePer6Months")}
              </th>
              <th onClick={() => handleSort("pricePerYear")} className={sortKey === "pricePerYear" ? "sorted" : ""}>
                /Year {sortIcon("pricePerYear")}
              </th>
              <th>Button</th>
              <th>Features</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j}><div className="skeleton-cell" style={{ width: j === 0 ? 28 : "80%" }} /></td>
                    ))}
                  </tr>
                ))
              : paginated.length === 0
              ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="table-empty">
                        <i className="bi bi-list-check" />
                        {search ? "No plans match your search" : "No plans yet — click Add Plan to get started"}
                      </div>
                    </td>
                  </tr>
                )
              : paginated.map((plan) => (
                  <tr key={plan.id}>
                    <td><span className="order-badge">{plan.order}</span></td>
                    <td><strong>{plan.name}</strong></td>
                    <td>
                      <span className="color-swatch">
                        <span className="color-dot" style={{ background: plan.color }} />
                        <code style={{ fontSize: "0.8rem", color: "#888" }}>{plan.color}</code>
                      </span>
                    </td>
                    <td>${Number(plan.pricePerMonth).toFixed(2)}</td>
                    <td>${Number(plan.pricePer6Months).toFixed(2)}</td>
                    <td>${Number(plan.pricePerYear).toFixed(2)}</td>
                    <td>{plan.buttonText}</td>
                    <td>
                      <span className="feature-count-badge">{plan.features?.length ?? 0} features</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-icon-edit" title="Edit" onClick={() => openEdit(plan)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn-icon btn-icon-delete" title="Delete" onClick={() => setDeletingPlan(plan)}>
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="table-pagination">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <div className="pagination-buttons">
              <button className="btn-page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <i className="bi bi-chevron-left" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn-page ${page === i + 1 ? "active" : ""}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CREATE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {createOpen && (
        <div className="modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="bi bi-plus-circle" /> New Plan</h2>
              <button className="modal-close" onClick={() => setCreateOpen(false)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body">
              <PlanFormFields form={form} onChange={field} />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreate} disabled={submitting || !form.name.trim()}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Create Plan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {editPlan && (
        <div className="modal-backdrop" onClick={() => setEditPlan(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="color-dot" style={{ background: editPlan.color, width: 14, height: 14, borderRadius: "50%", display: "inline-block", marginRight: 6 }} />
                Edit — {editPlan.name}
              </h2>
              <button className="modal-close" onClick={() => setEditPlan(null)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body">
              <PlanFormFields form={form} onChange={field} />

              {/* Features */}
              <div className="features-section">
                <div className="features-section-header">
                  <h3>Features ({editPlan.features?.length ?? 0})</h3>
                </div>

                {(editPlan.features ?? [])
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((f) => (
                    <FeatureRow
                      key={f.id}
                      feature={f}
                      onSave={handleSaveFeature}
                      onDelete={handleDeleteFeature}
                    />
                  ))}

                {/* Add new feature */}
                <div className="feature-new-row">
                  <input
                    type="number"
                    className="form-control feature-order-input"
                    value={newFeatureOrder}
                    min={1}
                    onChange={(e) => setNewFeatureOrder(parseInt(e.target.value) || 1)}
                    placeholder="#"
                  />
                  <input
                    type="text"
                    className="form-control feature-desc-input"
                    value={newFeatureDesc}
                    onChange={(e) => setNewFeatureDesc(e.target.value)}
                    placeholder="New feature description…"
                    onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                  />
                  <button
                    className="btn-add-feature"
                    onClick={handleAddFeature}
                    disabled={addingFeature || !newFeatureDesc.trim()}
                  >
                    {addingFeature ? <i className="bi bi-hourglass-split" /> : <><i className="bi bi-plus-lg" /> Add</>}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditPlan(null)}>Cancel</button>
              <button className="btn-save" onClick={handleUpdate} disabled={submitting || !form.name.trim()}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {deletingPlan && (
        <div className="modal-backdrop" onClick={() => setDeletingPlan(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-body">
              <div className="delete-icon"><i className="bi bi-trash3-fill" /></div>
              <h3>Delete Plan?</h3>
              <p>
                This will permanently delete <strong>{deletingPlan.name}</strong> and all its features.
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeletingPlan(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Deleting…</> : <><i className="bi bi-trash3" /> Delete Plan</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

// ─── Shared plan form fields ──────────────────────────────────────────────────
interface PlanFormFieldsProps {
  form: CreatePlanPayload;
  onChange: (key: keyof CreatePlanPayload, value: string | number) => void;
}

function PlanFormFields({ form, onChange }: PlanFormFieldsProps) {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label>Plan Name</label>
        <input
          className="form-control"
          placeholder="e.g. Gold"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Button Text</label>
        <input
          className="form-control"
          placeholder="e.g. Subscribe Now"
          value={form.buttonText}
          onChange={(e) => onChange("buttonText", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Price / Month ($)</label>
        <input
          type="number"
          className="form-control"
          min={0}
          step={0.01}
          value={form.pricePerMonth}
          onChange={(e) => onChange("pricePerMonth", parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label>Price / 6 Months ($)</label>
        <input
          type="number"
          className="form-control"
          min={0}
          step={0.01}
          value={form.pricePer6Months}
          onChange={(e) => onChange("pricePer6Months", parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label>Price / Year ($)</label>
        <input
          type="number"
          className="form-control"
          min={0}
          step={0.01}
          value={form.pricePerYear}
          onChange={(e) => onChange("pricePerYear", parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label>Display Order</label>
        <input
          type="number"
          className="form-control"
          min={1}
          value={form.order}
          onChange={(e) => onChange("order", parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="form-group">
        <label>Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={form.color}
            onChange={(e) => onChange("color", e.target.value)}
          />
          <input
            type="text"
            value={form.color}
            onChange={(e) => onChange("color", e.target.value)}
            placeholder="#ff3b3b"
            maxLength={9}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Thumbnail URL <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.6 }}>(optional)</span></label>
        <input
          className="form-control"
          placeholder="https://..."
          value={form.thumb ?? ""}
          onChange={(e) => onChange("thumb", e.target.value)}
        />
      </div>
    </div>
  );
}

export default AdminPlans;
