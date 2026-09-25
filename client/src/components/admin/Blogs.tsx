import { useEffect, useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "../../assets/css/admin/plans.css";
import "../../assets/css/admin/blogs.css";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  type Blog,
  type BlogMedia,
  type CreateBlogPayload,
} from "../../services/blogService";
import { uploadFile, getFileUrl } from "../../services/uploadService";

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
function emptyForm(): CreateBlogPayload {
  return {
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    media: [],
    order: 1,
    isPublished: false,
  };
}

const PAGE_SIZE = 8;

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// ─── Media item row ───────────────────────────────────────────────────────────
interface MediaRowProps {
  item: BlogMedia;
  index: number;
  onRemove: (i: number) => void;
  onCaptionChange: (i: number, val: string) => void;
}

const MediaRow = ({ item, index, onRemove, onCaptionChange }: MediaRowProps) => {
  const url = getFileUrl(item.url);
  return (
    <div className="blog-media-row">
      <div className="blog-media-thumb">
        {item.type === "image" ? (
          <img src={url} alt={item.caption || `media-${index}`} />
        ) : (
          <video src={url} muted playsInline />
        )}
        <span className={`blog-media-type-badge ${item.type}`}>
          <i className={`bi bi-${item.type === "image" ? "image" : "camera-video"}`} />
          {item.type}
        </span>
      </div>
      <div className="blog-media-info">
        <input
          className="form-control-admin"
          placeholder="Caption (optional)"
          value={item.caption || ""}
          onChange={(e) => onCaptionChange(index, e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn-icon-danger"
        onClick={() => onRemove(index)}
        title="Remove"
      >
        <i className="bi bi-trash" />
      </button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Blog>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Blog | null>(null);
  const [deletingItem, setDeletingItem] = useState<Blog | null>(null);
  const [form, setForm] = useState<CreateBlogPayload>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── Load ──────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch {
      showToast("Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Derived ───────────────────────────────────────────────────────
  const filtered = blogs
    .filter((b) =>
      [b.title, b.excerpt || "", stripHtml(b.content)]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = (av ?? "") < (bv ?? "") ? -1 : (av ?? "") > (bv ?? "") ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: keyof Blog) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortIcon = (key: keyof Blog) => {
    if (key !== sortKey) return <i className="bi bi-chevron-expand" style={{ opacity: 0.3 }} />;
    return sortDir === "asc" ? <i className="bi bi-chevron-up" /> : <i className="bi bi-chevron-down" />;
  };

  // ── Cover image upload ────────────────────────────────────────────
  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const result = await uploadFile(file, "image");
      setForm((f) => ({ ...f, coverImage: result.path }));
      showToast("Cover image uploaded", "success");
    } catch {
      showToast("Cover upload failed", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  // ── Media uploads ─────────────────────────────────────────────────
  const handleMediaUpload = async (files: FileList) => {
    setUploadingMedia(true);
    try {
      const newItems: BlogMedia[] = [];
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        const result = await uploadFile(file, isVideo ? "video" : "image");
        newItems.push({ url: result.path, type: isVideo ? "video" : "image", caption: "" });
      }
      setForm((f) => ({ ...f, media: [...(f.media ?? []), ...newItems] }));
      showToast(`${newItems.length} file(s) uploaded`, "success");
    } catch {
      showToast("Media upload failed", "error");
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (index: number) => {
    setForm((f) => ({
      ...f,
      media: (f.media ?? []).filter((_, i) => i !== index),
    }));
  };

  const updateCaption = (index: number, caption: string) => {
    setForm((f) => ({
      ...f,
      media: (f.media ?? []).map((m, i) => (i === index ? { ...m, caption } : m)),
    }));
  };

  // ── Create ────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ ...emptyForm(), order: blogs.length + 1 });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.content?.trim()) { showToast("Content is required", "error"); return; }
    setSubmitting(true);
    try {
      await createBlog(form);
      setCreateOpen(false);
      await load();
      showToast("Blog post created", "success");
    } catch {
      showToast("Failed to create blog post", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (item: Blog) => {
    setEditItem(item);
    setForm({
      title: item.title,
      excerpt: item.excerpt ?? "",
      content: item.content,
      coverImage: item.coverImage ?? "",
      media: item.media ?? [],
      order: item.order,
      isPublished: item.isPublished,
    });
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    if (!form.title?.trim()) { showToast("Title is required", "error"); return; }
    if (!form.content?.trim()) { showToast("Content is required", "error"); return; }
    setSubmitting(true);
    try {
      await updateBlog(editItem.id, form);
      setEditItem(null);
      await load();
      showToast("Blog post updated", "success");
    } catch {
      showToast("Failed to update blog post", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await deleteBlog(deletingItem.id);
      setDeletingItem(null);
      await load();
      showToast("Blog post deleted", "success");
    } catch {
      showToast("Failed to delete blog post", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Form panel (shared create / edit) ─────────────────────────────
  const renderFormPanel = (isEdit: boolean) => (
    <div className="blog-form-overlay" onClick={(e) => {
      if ((e.target as HTMLElement).classList.contains("blog-form-overlay")) {
        isEdit ? setEditItem(null) : setCreateOpen(false);
      }
    }}>
      <div className="blog-form-panel">
        <div className="blog-form-header">
          <h2>{isEdit ? "Edit Blog Post" : "New Blog Post"}</h2>
          <button
            className="blog-form-close"
            onClick={() => (isEdit ? setEditItem(null) : setCreateOpen(false))}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="blog-form-body">
          {/* ── Title */}
          <div className="blog-field-group">
            <label className="blog-field-label">Title <span className="req">*</span></label>
            <input
              className="form-control-admin"
              placeholder="Post title…"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* ── Excerpt */}
          <div className="blog-field-group">
            <label className="blog-field-label">Excerpt</label>
            <textarea
              className="form-control-admin"
              rows={2}
              placeholder="Short description shown in listing…"
              value={form.excerpt ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          {/* ── Cover image */}
          <div className="blog-field-group">
            <label className="blog-field-label">Cover Image</label>
            <div className="blog-cover-upload-row">
              {form.coverImage && (
                <img
                  src={getFileUrl(form.coverImage)}
                  alt="cover"
                  className="blog-cover-preview"
                />
              )}
              <button
                type="button"
                className="btn-secondary-admin"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? (
                  <><i className="bi bi-hourglass-split" /> Uploading…</>
                ) : (
                  <><i className="bi bi-image" /> {form.coverImage ? "Change" : "Upload"} Cover</>
                )}
              </button>
              {form.coverImage && (
                <button
                  type="button"
                  className="btn-icon-danger"
                  onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                  title="Remove cover"
                >
                  <i className="bi bi-x-circle" />
                </button>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
            />
          </div>

          {/* ── TinyMCE content */}
          <div className="blog-field-group">
            <label className="blog-field-label">Content <span className="req">*</span></label>
            <div className="blog-editor-wrapper">
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_KEY}
                value={form.content}
                onEditorChange={(content) => setForm((f) => ({ ...f, content }))}
                init={{
                  height: 420,
                  menubar: true,
                  plugins: [
                    "advlist", "autolink", "lists", "link", "image", "charmap",
                    "preview", "anchor", "searchreplace", "visualblocks", "code",
                    "fullscreen", "insertdatetime", "media", "table", "help", "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | bold italic underline strikethrough | " +
                    "alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | link image media | " +
                    "forecolor backcolor | code fullscreen | help",
                  content_style:
                    "body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; font-size: 15px; }",
                  skin: "oxide",
                  content_css: "default",
                  branding: false,
                  promotion: false,
                }}
              />
            </div>
          </div>

          {/* ── Media (images / videos) */}
          <div className="blog-field-group">
            <label className="blog-field-label">
              Media Gallery
              <span className="blog-field-hint">Images &amp; videos attached to this post</span>
            </label>

            {(form.media ?? []).length > 0 && (
              <div className="blog-media-list">
                {(form.media ?? []).map((item, i) => (
                  <MediaRow
                    key={i}
                    item={item}
                    index={i}
                    onRemove={removeMedia}
                    onCaptionChange={updateCaption}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              className="btn-secondary-admin blog-add-media-btn"
              onClick={() => mediaInputRef.current?.click()}
              disabled={uploadingMedia}
            >
              {uploadingMedia ? (
                <><i className="bi bi-hourglass-split" /> Uploading…</>
              ) : (
                <><i className="bi bi-plus-circle" /> Add Images / Videos</>
              )}
            </button>
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
            />
          </div>

          {/* ── Order & Published row */}
          <div className="blog-meta-row">
            <div className="blog-field-group blog-field-inline">
              <label className="blog-field-label">Order</label>
              <input
                type="number"
                className="form-control-admin"
                min={1}
                value={form.order ?? 1}
                onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="blog-field-group blog-field-inline">
              <label className="blog-field-label">Status</label>
              <div className="blog-toggle-row">
                <label className="blog-toggle">
                  <input
                    type="checkbox"
                    checked={form.isPublished ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  />
                  <span className="blog-toggle-slider" />
                </label>
                <span className={`blog-pub-label ${form.isPublished ? "published" : "draft"}`}>
                  {form.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="blog-form-footer">
          <button
            className="btn-secondary-admin"
            onClick={() => (isEdit ? setEditItem(null) : setCreateOpen(false))}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn-primary-admin"
            onClick={isEdit ? handleUpdate : handleCreate}
            disabled={submitting || uploadingMedia || uploadingCover}
          >
            {submitting ? (
              <><i className="bi bi-hourglass-split" /> Saving…</>
            ) : isEdit ? (
              <><i className="bi bi-check-lg" /> Save Changes</>
            ) : (
              <><i className="bi bi-plus-lg" /> Create Post</>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-plans admin-blogs">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          <i className={`bi bi-${toast.type === "success" ? "check-circle" : "exclamation-circle"}`} />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="admin-plans-header">
        <h1>
          Blog Posts
          <span>{blogs.length} post{blogs.length !== 1 ? "s" : ""}</span>
        </h1>
        <button className="btn-primary-admin" onClick={openCreate}>
          <i className="bi bi-plus-lg" /> New Post
        </button>
      </div>

      {/* Table */}
      <div className="plans-table-wrapper">
        <div className="plans-table-toolbar">
          <div className="plans-table-search">
            <i className="bi bi-search" />
            <input
              placeholder="Search posts…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="blog-loading">
            <i className="bi bi-hourglass-split" /> Loading…
          </div>
        ) : paginated.length === 0 ? (
          <div className="blog-empty">
            <i className="bi bi-journal-richtext" />
            <p>{search ? "No posts match your search." : "No blog posts yet. Create your first one!"}</p>
          </div>
        ) : (
          <table className="plans-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th
                  className="sortable-th"
                  onClick={() => handleSort("title")}
                >
                  Title {sortIcon("title")}
                </th>
                <th>Excerpt</th>
                <th
                  className="sortable-th"
                  onClick={() => handleSort("order")}
                  style={{ width: 80 }}
                >
                  Order {sortIcon("order")}
                </th>
                <th style={{ width: 90 }}>Media</th>
                <th
                  className="sortable-th"
                  onClick={() => handleSort("isPublished")}
                  style={{ width: 110 }}
                >
                  Status {sortIcon("isPublished")}
                </th>
                <th
                  className="sortable-th"
                  onClick={() => handleSort("createdAt")}
                  style={{ width: 130 }}
                >
                  Created {sortIcon("createdAt")}
                </th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((blog) => (
                <tr key={blog.id}>
                  <td className="blog-cover-cell">
                    {blog.coverImage ? (
                      <img
                        src={getFileUrl(blog.coverImage)}
                        alt="cover"
                        className="blog-table-cover"
                      />
                    ) : (
                      <div className="blog-table-no-cover">
                        <i className="bi bi-journal-richtext" />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="blog-title-cell">{blog.title}</div>
                  </td>
                  <td>
                    <div className="blog-excerpt-cell">
                      {blog.excerpt || <span style={{ color: "#bbb" }}>—</span>}
                    </div>
                  </td>
                  <td className="text-center">{blog.order}</td>
                  <td className="text-center">
                    <span className="blog-media-count">
                      <i className="bi bi-images" /> {blog.media?.length ?? 0}
                    </span>
                  </td>
                  <td>
                    <span className={`ann-status-badge ${blog.isPublished ? "ann-active" : "ann-inactive"}`}>
                      <i className={`bi bi-${blog.isPublished ? "check-circle-fill" : "circle"}`} />
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="blog-date-cell">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="plans-actions">
                      <button
                        className="btn-icon-edit"
                        title="Edit"
                        onClick={() => openEdit(blog)}
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="btn-icon-danger"
                        title="Delete"
                        onClick={() => setDeletingItem(blog)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="plans-pagination">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <i className="bi bi-chevron-left" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-btn${page === p ? " active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {createOpen && renderFormPanel(false)}
      {editItem && renderFormPanel(true)}

      {/* Delete confirm modal */}
      {deletingItem && (
        <div className="blog-form-overlay" onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains("blog-form-overlay"))
            setDeletingItem(null);
        }}>
          <div className="blog-delete-modal">
            <div className="blog-delete-icon">
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <h3>Delete Blog Post?</h3>
            <p>
              Are you sure you want to delete <strong>&ldquo;{deletingItem.title}&rdquo;</strong>?
              This action cannot be undone.
            </p>
            <div className="blog-delete-actions">
              <button
                className="btn-secondary-admin"
                onClick={() => setDeletingItem(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn-danger-admin"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting…" : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
