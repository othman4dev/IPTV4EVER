import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getBlog, getPublishedBlogs, type Blog } from "../../services/blogService";
import { getFileUrl } from "../../services/uploadService";
import "../../assets/css/blogs.css";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [related, setRelated] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    Promise.all([getBlog(Number(id)), getPublishedBlogs()])
      .then(([post, all]) => {
        setBlog(post);
        setRelated(all.filter((b) => b.id !== post.id).slice(0, 3));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Header />

      {loading && (
        <div className="blogs-state blogs-state-full">
          <div className="blogs-spinner" />
          <p>Loading post…</p>
        </div>
      )}

      {!loading && error && (
        <div className="blogs-state blogs-state-full">
          <i className="bi bi-exclamation-circle blogs-state-icon" />
          <p>Post not found or could not be loaded.</p>
          <button className="blogs-back-btn" onClick={() => navigate("/blogs")}>
            <i className="bi bi-arrow-left" /> Back to Blog
          </button>
        </div>
      )}

      {!loading && !error && blog && (
        <>
          {/* ── Cover + title hero ──────────────────────────────── */}
          <section className="post-hero">
            {blog.coverImage ? (
              <>
                <img
                  src={getFileUrl(blog.coverImage)}
                  alt={blog.title}
                  className="post-hero-img"
                />
                <div className="post-hero-overlay" />
              </>
            ) : (
              <div className="post-hero-no-cover" />
            )}
            <div className="post-hero-content">
              <button className="blogs-back-btn" onClick={() => navigate("/blogs")}>
                <i className="bi bi-arrow-left" /> All Posts
              </button>
              <h1 className="post-hero-title">{blog.title}</h1>
              <div className="post-hero-meta">
                <span><i className="bi bi-calendar3" /> {formatDate(blog.createdAt)}</span>
                {blog.media?.length > 0 && (
                  <span><i className="bi bi-images" /> {blog.media.length} media file{blog.media.length !== 1 ? "s" : ""}</span>
                )}
              </div>
              {blog.excerpt && (
                <p className="post-hero-excerpt">{blog.excerpt}</p>
              )}
            </div>
          </section>

          {/* ── Article body ────────────────────────────────────── */}
          <article className="post-body-wrap">
            <div
              className="post-content tinymce-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* ── Media gallery ─────────────────────────────────── */}
            {blog.media?.length > 0 && (
              <div className="post-gallery">
                <h2 className="post-gallery-title">
                  <i className="bi bi-images" /> Media Gallery
                </h2>
                <div className="post-gallery-grid">
                  {blog.media.map((item, i) => (
                    <div key={i} className="post-gallery-item">
                      {item.type === "image" ? (
                        <img
                          src={getFileUrl(item.url)}
                          alt={item.caption || `Image ${i + 1}`}
                          className="post-gallery-media"
                          onClick={() => setLightboxSrc(getFileUrl(item.url))}
                        />
                      ) : (
                        <video
                          src={getFileUrl(item.url)}
                          controls
                          className="post-gallery-media"
                          playsInline
                        />
                      )}
                      {item.caption && (
                        <p className="post-gallery-caption">{item.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Share row ─────────────────────────────────────── */}
            <div className="post-share-row">
              <span className="post-share-label">Share this post:</span>
              <div className="post-share-btns">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-share-btn twitter"
                >
                  <i className="bi bi-twitter-x" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-share-btn facebook"
                >
                  <i className="bi bi-facebook" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-share-btn linkedin"
                >
                  <i className="bi bi-linkedin" />
                </a>
              </div>
            </div>
          </article>

          {/* ── Related posts ───────────────────────────────────── */}
          {related.length > 0 && (
            <section className="post-related">
              <h2 className="post-related-title">More Posts</h2>
              <div className="blogs-grid post-related-grid">
                {related.map((rel) => (
                  <article
                    key={rel.id}
                    className="blogs-card"
                    onClick={() => navigate(`/blog/${rel.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/blog/${rel.id}`)}
                  >
                    <div className="blogs-card-img-wrap">
                      {rel.coverImage ? (
                        <img
                          src={getFileUrl(rel.coverImage)}
                          alt={rel.title}
                          className="blogs-card-img"
                        />
                      ) : (
                        <div className="blogs-card-img blogs-card-no-cover">
                          <i className="bi bi-journal-richtext" />
                        </div>
                      )}
                    </div>
                    <div className="blogs-card-body">
                      <span className="blogs-card-date">
                        <i className="bi bi-calendar3" /> {formatDate(rel.createdAt)}
                      </span>
                      <h3 className="blogs-card-title">{rel.title}</h3>
                      <div className="blogs-card-footer">
                        <span className="blogs-card-readmore">
                          Read more <i className="bi bi-arrow-right" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className="post-lightbox"
          onClick={() => setLightboxSrc(null)}
        >
          <button className="post-lightbox-close" onClick={() => setLightboxSrc(null)}>
            <i className="bi bi-x-lg" />
          </button>
          <img src={lightboxSrc} alt="Full size" className="post-lightbox-img" />
        </div>
      )}

      <Footer />
    </>
  );
};

export default BlogPostPage;
