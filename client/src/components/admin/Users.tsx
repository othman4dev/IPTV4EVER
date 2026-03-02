import { useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/users.css";
import {
  banUser,
  createUser,
  deleteUser,
  getUsers,
  unbanUser,
  updateUser,
  type User,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../../services/userService";
import {
  getSubscriptionsByUser,
  type Subscription,
} from "../../services/subscriptionService";

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
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

type SortKey = keyof Pick<User, "name" | "email" | "role" | "isBanned" | "createdAt">;
const PAGE_SIZE = 8;

const emptyCreate = (): CreateUserPayload => ({
  name: "",
  email: "",
  password: "",
  role: "client",
});

// ─── Main component ───────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // Modals
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [viewSubs, setViewSubs] = useState<Subscription[]>([]);
  const [viewSubsLoading, setViewSubsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [banningUser, setBanningUser] = useState<User | null>(null);

  const [createForm, setCreateForm] = useState<CreateUserPayload>(emptyCreate());
  const [editForm, setEditForm] = useState<UpdateUserPayload>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Load ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Open view modal ───────────────────────────────────────────────
  const openView = async (user: User) => {
    setViewUser(user);
    setViewSubs([]);
    setViewSubsLoading(true);
    try {
      setViewSubs(await getSubscriptionsByUser(user.id));
    } catch {
      /* fine */
    } finally {
      setViewSubsLoading(false);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────
  const filtered = users
    .filter((u) =>
      [u.name, u.email, u.role]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortIcon = (key: SortKey) => {
    if (key !== sortKey) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    return sortDir === "asc" ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />;
  };

  // ── Create ────────────────────────────────────────────────────────
  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createUser(createForm);
      setCreateOpen(false);
      await load();
      showToast("User created successfully");
    } catch {
      showToast("Failed to create user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleEdit = async () => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      await updateUser(editUser.id, payload);
      setEditUser(null);
      await load();
      showToast("User updated successfully");
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingUser) return;
    setSubmitting(true);
    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
      await load();
      showToast("User deleted");
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Ban / Unban ───────────────────────────────────────────────────
  const handleBanToggle = async () => {
    if (!banningUser) return;
    setSubmitting(true);
    try {
      if (banningUser.isBanned) {
        await unbanUser(banningUser.id);
        showToast(`${banningUser.name} has been unbanned`);
      } else {
        await banUser(banningUser.id);
        showToast(`${banningUser.name} has been banned`);
      }
      setBanningUser(null);
      await load();
    } catch {
      showToast("Action failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-plans admin-users">
      {/* ── Header ── */}
      <div className="admin-users-header">
        <h1>
          Users
          <span>{users.length} total</span>
        </h1>
        <button className="btn-primary-admin" onClick={() => { setCreateForm(emptyCreate()); setCreateOpen(true); }}>
          <i className="bi bi-person-plus" /> Add User
        </button>
      </div>

      {/* ── Table ── */}
      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search by name, email, role…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <table className="plans-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th onClick={() => handleSort("name")} className={sortKey === "name" ? "sorted" : ""}>
                User {sortIcon("name")}
              </th>
              <th onClick={() => handleSort("role")} className={sortKey === "role" ? "sorted" : ""}>
                Role {sortIcon("role")}
              </th>
              <th onClick={() => handleSort("isBanned")} className={sortKey === "isBanned" ? "sorted" : ""}>
                Status {sortIcon("isBanned")}
              </th>
              <th>Subscription</th>
              <th onClick={() => handleSort("createdAt")} className={sortKey === "createdAt" ? "sorted" : ""}>
                Joined {sortIcon("createdAt")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}><div className="skeleton-cell" style={{ width: j === 0 ? 28 : "70%" }} /></td>
                    ))}
                  </tr>
                ))
              : paginated.length === 0
              ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="table-empty">
                        <i className="bi bi-people" />
                        {search ? "No users match your search" : "No users yet"}
                      </div>
                    </td>
                  </tr>
                )
              : paginated.map((user, idx) => (
                  <tr key={user.id}>
                    <td><span className="order-badge">{(page - 1) * PAGE_SIZE + idx + 1}</span></td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{initials(user.name)}</div>
                        <div className="user-cell-info">
                          <span className="user-cell-name">{user.name}</span>
                          <span className="user-cell-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        <i className={`bi ${user.role === "admin" ? "bi-shield-fill" : "bi-person"}`} />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      {user.isBanned
                        ? <span className="status-badge status-banned"><i className="bi bi-slash-circle" /> Banned</span>
                        : <span className="status-badge status-active"><i className="bi bi-check-circle" /> Active</span>
                      }
                    </td>
                    <td>
                      {user.subscription
                        ? (
                            <span className="sub-badge sub-active">
                              <i className="bi bi-tv" />
                              {user.subscription.planName}
                            </span>
                          )
                        : <span className="sub-badge">None</span>
                      }
                    </td>
                    <td style={{ color: "#888", fontSize: "0.85rem" }}>{fmtDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-icon-view" title="View details" onClick={() => openView(user)}>
                          <i className="bi bi-eye" />
                        </button>
                        <button className="btn-icon btn-icon-edit" title="Edit" onClick={() => openEdit(user)}>
                          <i className="bi bi-pencil" />
                        </button>
                        {user.isBanned
                          ? (
                              <button className="btn-icon btn-icon-unban" title="Unban user" onClick={() => setBanningUser(user)}>
                                <i className="bi bi-person-check" />
                              </button>
                            )
                          : (
                              <button className="btn-icon btn-icon-ban" title="Ban user" onClick={() => setBanningUser(user)}>
                                <i className="bi bi-person-slash" />
                              </button>
                            )
                        }
                        <button className="btn-icon btn-icon-delete" title="Delete" onClick={() => setDeletingUser(user)}>
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
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="pagination-buttons">
              <button className="btn-page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <i className="bi bi-chevron-left" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={`btn-page${page === i + 1 ? " active" : ""}`} onClick={() => setPage(i + 1)}>
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
          VIEW MORE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {viewUser && (
        <div className="modal-backdrop" onClick={() => setViewUser(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="bi bi-person-lines-fill" /> User Details</h2>
              <button className="modal-close" onClick={() => setViewUser(null)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body">
              {/* Avatar + name + badges */}
              <div className="view-user-header">
                <div className="view-user-avatar">{initials(viewUser.name)}</div>
                <div className="view-user-info">
                  <h3>{viewUser.name}</h3>
                  <p>{viewUser.email}</p>
                  <div className="view-user-badges">
                    <span className={`role-badge role-${viewUser.role}`}>
                      <i className={`bi ${viewUser.role === "admin" ? "bi-shield-fill" : "bi-person"}`} />
                      {viewUser.role.charAt(0).toUpperCase() + viewUser.role.slice(1)}
                    </span>
                    {viewUser.isBanned
                      ? <span className="status-badge status-banned"><i className="bi bi-slash-circle" /> Banned</span>
                      : <span className="status-badge status-active"><i className="bi bi-check-circle" /> Active</span>
                    }
                  </div>
                </div>
              </div>

              {/* Meta */}
              <p className="view-section-title">Account Info</p>
              <div className="view-meta-grid">
                <div className="view-meta-item">
                  <label>User ID</label>
                  <p style={{ fontSize: "0.78rem", wordBreak: "break-all" }}>{viewUser.id}</p>
                </div>
                <div className="view-meta-item">
                  <label>Joined</label>
                  <p>{fmtDate(viewUser.createdAt)}</p>
                </div>
                <div className="view-meta-item">
                  <label>Last Updated</label>
                  <p>{fmtDate(viewUser.updatedAt)}</p>
                </div>
              </div>

              {/* Active subscription */}
              <p className="view-section-title">Active Subscription</p>
              <div className="view-subscription-box">
                {viewUser.subscription ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: "1rem", color: "#1a1a2e" }}>
                        <i className="bi bi-tv" style={{ marginRight: 6, color: "#ff3b3b" }} />
                        {viewUser.subscription.planName}
                      </strong>
                      <span className={`status-badge sub-status-${viewUser.subscription.status}`}>
                        {viewUser.subscription.status.charAt(0).toUpperCase() + viewUser.subscription.status.slice(1)}
                      </span>
                    </div>
                    <div className="view-sub-grid">
                      <div className="view-meta-item">
                        <label>Start Date</label>
                        <p>{fmtDate(viewUser.subscription.startDate)}</p>
                      </div>
                      <div className="view-meta-item">
                        <label>End Date</label>
                        <p>{viewUser.subscription.endDate ? fmtDate(viewUser.subscription.endDate) : "—"}</p>
                      </div>
                      <div className="view-meta-item">
                        <label>Price Paid</label>
                        <p>${Number(viewUser.subscription.pricePaid).toFixed(2)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="view-no-sub">No active subscription</p>
                )}
              </div>

              {/* Subscription history */}
              <p className="view-section-title">Subscription History</p>
              {viewSubsLoading ? (
                <div className="skeleton-cell" style={{ width: "100%", height: 40, borderRadius: 8 }} />
              ) : viewSubs.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "0.85rem", fontStyle: "italic" }}>No subscription history</p>
              ) : (
                <div className="sub-history-list">
                  {viewSubs.map((s) => (
                    <div key={s.id} className="sub-history-item">
                      <div>
                        <strong>{s.plan?.name ?? "Unknown Plan"}</strong>
                        <div className="sub-history-dates">
                          {fmtDate(s.startDate)} → {s.endDate ? fmtDate(s.endDate) : "ongoing"}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 600 }}>${Number(s.pricePaid).toFixed(2)}</span>
                        <span className={`status-badge sub-status-${s.status}`} style={{ fontSize: "0.72rem" }}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setViewUser(null)}>Close</button>
              <button className="btn-save" onClick={() => { setViewUser(null); openEdit(viewUser); }}>
                <i className="bi bi-pencil" /> Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CREATE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {createOpen && (
        <div className="modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="bi bi-person-plus" /> New User</h2>
              <button className="modal-close" onClick={() => setCreateOpen(false)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body">
              <UserFormFields
                form={createForm}
                requirePassword
                onChange={(k, v) => setCreateForm((f) => ({ ...f, [k]: v }))}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button
                className="btn-save"
                onClick={handleCreate}
                disabled={submitting || !createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()}
              >
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Create User</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════════════════════════ */}
      {editUser && (
        <div className="modal-backdrop" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <div className="user-avatar" style={{ display: "inline-flex", width: 28, height: 28, fontSize: "0.68rem", verticalAlign: "middle", marginRight: 8 }}>
                  {initials(editUser.name)}
                </div>
                Edit — {editUser.name}
              </h2>
              <button className="modal-close" onClick={() => setEditUser(null)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <div className="modal-body">
              <UserFormFields
                form={{ name: editForm.name ?? "", email: editForm.email ?? "", password: editForm.password ?? "", role: editForm.role ?? editUser.role }}
                requirePassword={false}
                onChange={(k, v) => setEditForm((f) => ({ ...f, [k]: v }))}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn-save" onClick={handleEdit} disabled={submitting}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Saving…</> : <><i className="bi bi-check-lg" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {deletingUser && (
        <div className="modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-body">
              <div className="delete-icon"><i className="bi bi-person-x-fill" /></div>
              <h3>Delete User?</h3>
              <p>
                This will permanently delete <strong>{deletingUser.name}</strong> and all their data.
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeletingUser(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? <><i className="bi bi-hourglass-split" /> Deleting…</> : <><i className="bi bi-trash3" /> Delete User</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          BAN / UNBAN MODAL
      ══════════════════════════════════════════════════════════════ */}
      {banningUser && (
        <div className="modal-backdrop" onClick={() => setBanningUser(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="ban-modal-body">
              <div className={`ban-icon${banningUser.isBanned ? " unban-icon" : ""}`}>
                <i className={`bi ${banningUser.isBanned ? "bi-person-check-fill" : "bi-person-slash"}`} />
              </div>
              <h3>{banningUser.isBanned ? "Unban User?" : "Ban User?"}</h3>
              <p>
                {banningUser.isBanned
                  ? <>This will restore <strong>{banningUser.name}</strong>'s access to the platform.</>
                  : <>This will block <strong>{banningUser.name}</strong> from accessing the platform.</>
                }
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setBanningUser(null)}>Cancel</button>
              {banningUser.isBanned
                ? (
                    <button className="btn-unban" onClick={handleBanToggle} disabled={submitting}>
                      {submitting ? <><i className="bi bi-hourglass-split" /> …</> : <><i className="bi bi-person-check" /> Unban</>}
                    </button>
                  )
                : (
                    <button className="btn-ban" onClick={handleBanToggle} disabled={submitting}>
                      {submitting ? <><i className="bi bi-hourglass-split" /> …</> : <><i className="bi bi-person-slash" /> Ban User</>}
                    </button>
                  )
              }
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

// ─── Shared form fields ───────────────────────────────────────────────────────
interface UserFormFieldsProps {
  form: { name: string; email: string; password: string; role: "admin" | "client" };
  requirePassword: boolean;
  onChange: (key: string, value: string) => void;
}

function UserFormFields({ form, requirePassword, onChange }: UserFormFieldsProps) {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label>Full Name</label>
        <input
          className="form-control"
          placeholder="e.g. John Doe"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          className="form-control"
          placeholder="e.g. john@example.com"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          Password
          {!requirePassword && (
            <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.6 }}> (leave blank to keep current)</span>
          )}
        </label>
        <input
          type="password"
          className="form-control"
          placeholder={requirePassword ? "Min 6 characters" : "New password (optional)"}
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select
          className="form-control"
          value={form.role}
          onChange={(e) => onChange("role", e.target.value)}
          style={{ cursor: "pointer" }}
        >
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
}

export default AdminUsers;
