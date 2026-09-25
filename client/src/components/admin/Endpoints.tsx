import { useCallback, useEffect, useRef, useState } from "react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/announcements.css";
import "../../assets/css/admin/endpoints.css";
import {
  createEndpoint,
  deleteEndpoint,
  getEndpoints,
  updateEndpoint,
  type Endpoint,
  type CreateEndpointPayload,
} from "../../services/endpointService";

type ToastState = { message: string; type: "success" | "error" } | null;

type EndpointFormErrors = Partial<Record<keyof CreateEndpointPayload, string>>;

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

function emptyForm(): CreateEndpointPayload {
  return { username: "", password: "", url: "" };
}

const PAGE_SIZE = 8;

const AdminEndpoints = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Endpoint>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Endpoint | null>(null);
  const [deletingItem, setDeletingItem] = useState<Endpoint | null>(null);
  const [form, setForm] = useState<CreateEndpointPayload>(emptyForm());
  const [formErrors, setFormErrors] = useState<EndpointFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEndpoints();
      setEndpoints(data);
    } catch {
      showToast("Failed to load endpoints", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = endpoints
    .filter((endpoint) =>
      [
        endpoint.playlistName,
        endpoint.username,
        endpoint.password,
        endpoint.url,
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

  const handleSort = (key: keyof Endpoint) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const sortIcon = (key: keyof Endpoint) => {
    if (key !== sortKey) {
      return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    }
    return sortDir === "asc" ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />;
  };

  const validateForm = (payload: CreateEndpointPayload) => {
    const nextErrors: EndpointFormErrors = {};
    const username = payload.username.trim();
    const password = payload.password.trim();
    const url = payload.url.trim();

    if (!username) nextErrors.username = "Username is required";
    if (!password) nextErrors.password = "Password is required";
    if (!url) nextErrors.url = "URL is required";
    else {
      try {
        new URL(url);
      } catch {
        nextErrors.url = "URL must be a valid address";
      }
    }
    setFormErrors(nextErrors);
    return nextErrors;
  };

  const openCreate = () => {
    setForm(emptyForm());
    setFormErrors({});
    setCreateOpen(true);
  };

  const openEdit = (item: Endpoint) => {
    setEditItem(item);
    setForm({
      username: item.username,
      password: item.password,
      url: item.url,
    });
    setFormErrors({});
  };

  const handleCreate = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      showToast("Please fix the form errors", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createEndpoint({
        username: form.username.trim(),
        password: form.password.trim(),
        url: form.url.trim(),
      });
      setCreateOpen(false);
      await load();
      showToast("Endpoint created", "success");
    } catch {
      showToast("Failed to create endpoint", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      showToast("Please fix the form errors", "error");
      return;
    }
    setSubmitting(true);
    try {
      await updateEndpoint(editItem.id, {
        username: form.username.trim(),
        password: form.password.trim(),
        url: form.url.trim(),
      });
      setEditItem(null);
      await load();
      showToast("Endpoint updated", "success");
    } catch {
      showToast("Failed to update endpoint", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await deleteEndpoint(deletingItem.id);
      setDeletingItem(null);
      await load();
      showToast("Endpoint deleted", "success");
    } catch {
      showToast("Failed to delete endpoint", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key: keyof CreateEndpointPayload, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
  };

  return (
    <div className="admin-plans admin-announcements">
      <div className="admin-plans-header">
        <h1>
          Endpoints
          <span>{endpoints.length} total</span>
        </h1>
        <button className="btn-primary-admin" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Endpoint
        </button>
      </div>

      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search endpoints..."
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
              <th onClick={() => handleSort("id")}>ID {sortIcon("id")}</th>
              <th onClick={() => handleSort("playlistName")}>Playlist {sortIcon("playlistName")}</th>
              <th onClick={() => handleSort("username")}>Username {sortIcon("username")}</th>
              <th>Password</th>
              <th onClick={() => handleSort("url")}>URL {sortIcon("url")}</th>
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
                    <i className="bi bi-link-45deg" />
                    {search ? "No endpoints match your search." : "No endpoints yet. Create one!"}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="order-badge">#{item.id}</span>
                  </td>
                  <td>
                    <span className="endpoint-playlist-cell">
                      <i className="bi bi-tags" />
                      {item.playlistName}
                    </span>
                  </td>
                  <td className="endpoint-username-cell">{item.username}</td>
                  <td className="endpoint-password-cell">{"•".repeat(Math.max(item.password.length, 6))}</td>
                  <td className="endpoint-url-cell">
                    <a href={item.url} target="_blank" rel="noreferrer" className="endpoint-copy-text">
                      {item.url}
                    </a>
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
              <button className="btn-page" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
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
              <button className="btn-page" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>
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
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setCreateOpen(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2>
                <i className="bi bi-link-45deg" /> New Endpoint
              </h2>
              <button className="modal-close" onClick={() => setCreateOpen(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <EndpointForm
                form={form}
                formErrors={formErrors}
                setField={setField}
              />
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

      {editItem && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEditItem(null);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2>
                <i className="bi bi-pencil" /> Edit Endpoint
              </h2>
              <button className="modal-close" onClick={() => setEditItem(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="modal-body">
              <EndpointForm
                form={form}
                formErrors={formErrors}
                setField={setField}
              />
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

      {deletingItem && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDeletingItem(null);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2>
                <i className="bi bi-trash" /> Delete Endpoint
              </h2>
              <button className="modal-close" onClick={() => setDeletingItem(null)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="delete-modal-body">
              <div className="delete-icon">
                <i className="bi bi-exclamation-triangle" />
              </div>
              <h3>Delete this endpoint?</h3>
              <p>
                <strong>{deletingItem.username}</strong>
                <br />
                {deletingItem.url}
                <br />
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeletingItem(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitting}>
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

      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          <i className={`bi ${toast.type === "success" ? "bi-check-circle" : "bi-exclamation-circle"}`} />
          {toast.message}
        </div>
      )}
    </div>
  );
};

const EndpointForm = ({
  form,
  formErrors,
  setField,
}: {
  form: CreateEndpointPayload;
  formErrors: EndpointFormErrors;
  setField: (key: keyof CreateEndpointPayload, value: string) => void;
}) => {
  return (
    <div className="endpoint-form">
      <div className="endpoint-helper-note">
        <i className="bi bi-info-circle" />
        <span>Playlist name is fixed by the system and will always be saved as <strong>iptv4ever</strong>.</span>
      </div>

      <div className="form-group full-width">
        <label>Playlist Name</label>
        <div className="endpoint-fixed-field">
          <span className="endpoint-fixed-pill">
            <i className="bi bi-lock-fill" /> iptv4ever
          </span>
          <span className="endpoint-fixed-text">This value is managed automatically and cannot be edited.</span>
        </div>
      </div>

      <div className="form-group full-width">
        <label>Username *</label>
        <input
          type="text"
          className="form-control"
          value={form.username}
          onChange={(event) => setField("username", event.target.value)}
          placeholder="Enter IPTV username"
        />
        {formErrors.username && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.username}</p>}
      </div>

      <div className="form-group full-width">
        <label>Password *</label>
        <input
          type="text"
          className="form-control"
          value={form.password}
          onChange={(event) => setField("password", event.target.value)}
          placeholder="Enter IPTV password"
        />
        {formErrors.password && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.password}</p>}
      </div>

      <div className="form-group full-width">
        <label>URL *</label>
        <input
          type="url"
          className="form-control"
          value={form.url}
          onChange={(event) => setField("url", event.target.value)}
          placeholder="https://example.com/get.php?..."
        />
        {formErrors.url && <p className="ann-hint" style={{ color: "#dc2626" }}>{formErrors.url}</p>}
      </div>
    </div>
  );
};

export default AdminEndpoints;
