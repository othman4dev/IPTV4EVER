import { useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/subscriptions.css";
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  updateSubscription,
  type CreateSubscriptionPayload,
  type Subscription,
  type SubscriptionStatus,
} from "../../services/subscriptionService";
import { getPlans, type Plan } from "../../services/planService";
import { getUsers, type User } from "../../services/userService";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: SubscriptionStatus[] = ["pending", "ongoing", "paused", "expired"];

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  ongoing: "sub-status-ongoing",
  pending: "sub-status-pending",
  paused: "sub-status-paused",
  expired: "sub-status-expired",
};

const STATUS_ICONS: Record<SubscriptionStatus, string> = {
  ongoing: "bi-check-circle-fill",
  pending: "bi-clock-fill",
  paused: "bi-pause-circle-fill",
  expired: "bi-x-circle-fill",
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function emptyForm(): CreateSubscriptionPayload {
  const today = new Date().toISOString().split("T")[0];
  return { userId: "", planId: 0, status: "pending", startDate: today, pricePaid: 0 };
}

const PAGE_SIZE = 10;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: SubscriptionStatus }) => (
  <span className={`sub-status-badge ${STATUS_COLORS[status]}`}>
    <i className={`bi ${STATUS_ICONS[status]}`} />
    {status}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [sortKey, setSortKey] = useState<keyof Subscription>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Subscription | null>(null);
  const [deletingItem, setDeletingItem] = useState<Subscription | null>(null);
  const [form, setForm] = useState<CreateSubscriptionPayload>(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  // ── User picker state ─────────────────────────────────────────────
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDrop, setShowUserDrop] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  // ── Load ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const [subs, pl, users] = await Promise.all([getSubscriptions(), getPlans(), getUsers()]);
      setSubscriptions(subs);
      setPlans(pl);
      setAllUsers(users);
    } catch {
      showToast("Failed to load subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  // ── Stats ─────────────────────────────────────────────────────────
  const statsTotal   = subscriptions.length;
  const statsOngoing = subscriptions.filter((s) => s.status === "ongoing").length;
  const statsPending = subscriptions.filter((s) => s.status === "pending").length;
  const statsPaused  = subscriptions.filter((s) => s.status === "paused").length;
  const statsExpired = subscriptions.filter((s) => s.status === "expired").length;
  const statsRevenue = subscriptions
    .filter((s) => s.status !== "pending")
    .reduce((acc, s) => acc + Number(s.pricePaid), 0);

  // ── Derived ───────────────────────────────────────────────────────
  const filtered = subscriptions
    .filter((s) => statusFilter === "all" || s.status === statusFilter)
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        s.user?.name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.plan?.name?.toLowerCase().includes(q) ||
        String(s.id).includes(q)
      );
    })
    .sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey as string];
      const bv = (b as unknown as Record<string, unknown>)[sortKey as string];
      const cmp = (av ?? "") < (bv ?? "") ? -1 : (av ?? "") > (bv ?? "") ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: keyof Subscription) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const sortIcon = (key: keyof Subscription) => {
    if (key !== sortKey) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    return sortDir === "asc" ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />;
  };

  // ── Create ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm());
    setSelectedUser(null);
    setUserQuery("");
    setUserResults([]);
    setShowUserDrop(false);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.userId.trim()) { showToast("Please select a user", "error"); return; }
    if (!form.planId) { showToast("Plan is required", "error"); return; }
    if (!form.startDate) { showToast("Start date is required", "error"); return; }
    setSubmitting(true);
    try {
      await createSubscription({ ...form, endDate: form.endDate || undefined });
      setCreateOpen(false);
      await load();
      showToast("Subscription created", "success");
    } catch {
      showToast("Failed to create subscription", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (item: Subscription) => {
    setEditItem(item);
    setForm({
      userId: item.user.id,
      planId: item.plan.id,
      status: item.status,
      startDate: item.startDate?.split("T")[0] ?? "",
      endDate: item.endDate?.split("T")[0] ?? "",
      pricePaid: Number(item.pricePaid),
    });
    const found = allUsers.find((u) => u.id === item.user.id);
    setSelectedUser(
      found ?? ({ id: item.user.id, name: item.user.name, email: item.user.email } as User),
    );
    setUserQuery("");
    setUserResults([]);
    setShowUserDrop(false);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSubmitting(true);
    try {
      await updateSubscription(editItem.id, { ...form, endDate: form.endDate || undefined });
      setEditItem(null);
      await load();
      showToast("Subscription updated", "success");
    } catch {
      showToast("Failed to update subscription", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await deleteSubscription(deletingItem.id);
      setDeletingItem(null);
      await load();
      showToast("Subscription deleted", "success");
    } catch {
      showToast("Failed to delete subscription", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = <K extends keyof CreateSubscriptionPayload>(k: K, v: CreateSubscriptionPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ── User picker helpers ───────────────────────────────────────────
  const handleUserQuery = (q: string) => {
    setUserQuery(q);
    if (!q.trim()) { setUserResults([]); setShowUserDrop(false); return; }
    const lower = q.toLowerCase();
    const results = allUsers
      .filter((u) => u.email.toLowerCase().includes(lower) || u.name.toLowerCase().includes(lower))
      .slice(0, 8);
    setUserResults(results);
    setShowUserDrop(results.length > 0);
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setForm((f) => ({ ...f, userId: user.id }));
    setUserQuery("");
    setUserResults([]);
    setShowUserDrop(false);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setForm((f) => ({ ...f, userId: "" }));
  };

  const handlePlanChange = (planId: number) => {
    const plan = plans.find((p) => p.id === planId);
    setForm((f) => ({ ...f, planId, pricePaid: plan ? plan.pricePerMonth : f.pricePaid }));
  };

  // ── Form JSX (inline to avoid unmount-on-rerender) ────────────────
  const formJSX = (
    <>
      <div className="sub-form-section-title">User *</div>
      <div className="form-group">
        {selectedUser ? (
          <div className="sub-user-selected-card">
            <div className="sub-user-avatar-sm">{selectedUser.name.charAt(0).toUpperCase()}</div>
            <div className="sub-user-cell">
              <span className="sub-user-name">{selectedUser.name}</span>
              <span className="sub-user-email">{selectedUser.email}</span>
            </div>
            <button type="button" className="sub-user-card-clear" onClick={clearUser}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ) : (
          <div className="sub-user-picker" ref={userSearchRef}>
            <div className="sub-user-search-wrapper">
              <i className="bi bi-search sub-user-search-icon" />
              <input
                className="form-control sub-user-search-input"
                type="text"
                placeholder="Search by name or email…"
                value={userQuery}
                onChange={(e) => handleUserQuery(e.target.value)}
                onFocus={() => userQuery && setShowUserDrop(userResults.length > 0)}
                onBlur={() => setTimeout(() => setShowUserDrop(false), 150)}
                autoComplete="off"
              />
            </div>
            {showUserDrop && (
              <div className="sub-user-dropdown">
                {userResults.map((u) => (
                  <div key={u.id} className="sub-user-result" onMouseDown={() => selectUser(u)}>
                    <div className="sub-user-avatar-sm">{u.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="sub-user-name">{u.name}</div>
                      <div className="sub-user-email">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sub-form-section-title">Plan &amp; Pricing</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Plan *</label>
          <select
            className="form-control"
            value={form.planId}
            onChange={(e) => handlePlanChange(Number(e.target.value))}
          >
            <option value={0}>— Select plan —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.pricePerMonth}/mo)
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Price Paid ($)</label>
          <input
            className="form-control"
            type="number"
            min={0}
            step={0.01}
            value={form.pricePaid}
            onChange={(e) => setField("pricePaid", parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="sub-form-section-title">Status &amp; Dates</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Status *</label>
          <select
            className="form-control"
            value={form.status}
            onChange={(e) => setField("status", e.target.value as SubscriptionStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Start Date *</label>
          <input
            className="form-control"
            type="date"
            value={form.startDate}
            onChange={(e) => setField("startDate", e.target.value)}
          />
        </div>
        <div className="form-group full-width">
          <label>End Date</label>
          <input
            className="form-control"
            type="date"
            value={form.endDate ?? ""}
            onChange={(e) => setField("endDate", e.target.value)}
          />
        </div>
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="admin-plans admin-subscriptions">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-exclamation-circle"}`} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="admin-plans-header">
        <h1>
          Subscriptions
          <span>{subscriptions.length} total</span>
        </h1>
        <button className="btn-primary-admin" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Subscription
        </button>
      </div>

      {/* Stats cards */}
      <div className="sub-stats">
        <div className="sub-stat-card">
          <span className="sub-stat-label">Total</span>
          <span className="sub-stat-value">{statsTotal}</span>
        </div>
        <div className="sub-stat-card sub-stat-green">
          <span className="sub-stat-label">Active</span>
          <span className="sub-stat-value">{statsOngoing}</span>
        </div>
        <div className="sub-stat-card sub-stat-orange">
          <span className="sub-stat-label">Pending</span>
          <span className="sub-stat-value">{statsPending}</span>
        </div>
        <div className="sub-stat-card sub-stat-blue">
          <span className="sub-stat-label">Paused</span>
          <span className="sub-stat-value">{statsPaused}</span>
        </div>
        <div className="sub-stat-card sub-stat-gray">
          <span className="sub-stat-label">Expired</span>
          <span className="sub-stat-value">{statsExpired}</span>
        </div>
        <div className="sub-stat-card sub-stat-revenue">
          <span className="sub-stat-label">Active Revenue</span>
          <span className="sub-stat-value">${statsRevenue.toFixed(0)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search by user, plan, ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="sub-filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as SubscriptionStatus | "all"); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <table className="plans-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                # {sortIcon("id")}
              </th>
              <th onClick={() => handleSort("user" as keyof Subscription)} style={{ cursor: "pointer" }}>
                User {sortIcon("user" as keyof Subscription)}
              </th>
              <th>Plan</th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                Status {sortIcon("status")}
              </th>
              <th onClick={() => handleSort("startDate")} style={{ cursor: "pointer" }}>
                Start {sortIcon("startDate")}
              </th>
              <th onClick={() => handleSort("endDate")} style={{ cursor: "pointer" }}>
                End {sortIcon("endDate")}
              </th>
              <th onClick={() => handleSort("pricePaid")} style={{ cursor: "pointer" }}>
                Price Paid {sortIcon("pricePaid")}
              </th>
              <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>
                Created {sortIcon("createdAt")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="skeleton-row">
                  {Array.from({ length: 9 }).map((__, j) => <td key={j}><div className="skeleton-cell" /></td>)}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem", color: "#aaa" }}>
                  <i className="bi bi-inbox" style={{ fontSize: "1.8rem", display: "block", marginBottom: 8 }} />
                  No subscriptions found
                </td>
              </tr>
            ) : (
              paginated.map((sub) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 600, color: "#888", fontSize: "0.85rem" }}>#{sub.id}</td>
                  <td>
                    <div className="sub-user-cell">
                      <span className="sub-user-name">{sub.user?.name ?? "—"}</span>
                      <span className="sub-user-email">{sub.user?.email ?? ""}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="sub-plan-badge"
                      style={sub.plan?.color ? { background: sub.plan.color + "22", color: sub.plan.color } : {}}
                    >
                      {sub.plan?.name ?? "—"}
                    </span>
                  </td>
                  <td><StatusBadge status={sub.status} /></td>
                  <td><span className="sub-date">{fmtDate(sub.startDate)}</span></td>
                  <td>
                    {sub.endDate
                      ? <span className="sub-date">{fmtDate(sub.endDate)}</span>
                      : <span className="sub-date-null">No end date</span>}
                  </td>
                  <td><span className="sub-price">${Number(sub.pricePaid).toFixed(2)}</span></td>
                  <td><span className="sub-date">{fmtDate(sub.createdAt)}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-icon-edit" title="Edit" onClick={() => openEdit(sub)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn-icon btn-icon-delete" title="Delete" onClick={() => setDeletingItem(sub)}>
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
        {totalPages > 1 && (
          <div className="plans-table-pagination">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <i className="bi bi-chevron-left" />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        )}
      </div>

      {/* ── Create Modal ─────────────────────────────────────────── */}
      {createOpen && (
        <div className="modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Subscription</h2>
              <button className="modal-close" onClick={() => setCreateOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {formJSX}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-save" onClick={handleCreate} disabled={submitting}>
                {submitting ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ───────────────────────────────────────────── */}
      {editItem && (
        <div className="modal-backdrop" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Subscription #{editItem.id}</h2>
              <button className="modal-close" onClick={() => setEditItem(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {formJSX}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn-save" onClick={handleUpdate} disabled={submitting}>
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────── */}
      {deletingItem && (
        <div className="modal-backdrop" onClick={() => setDeletingItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Subscription</h2>
              <button className="modal-close" onClick={() => setDeletingItem(null)}>&times;</button>
            </div>
            <div className="modal-body delete-modal-body">
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: 12 }} />
              <p>
                Are you sure you want to delete the subscription for{" "}
                <strong>{deletingItem.user?.name ?? `#${deletingItem.id}`}</strong>?
              </p>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeletingItem(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
