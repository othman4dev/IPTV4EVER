import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getPublishedBlogs, type Blog } from "../../services/blogService";
import { getFileUrl } from "../../services/uploadService";
import "../../assets/css/blogs.css";

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const BlogsPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPublishedBlogs()
      .then(setBlogs)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <>
      <Header />

      {/* ── Page Hero ──────────────────────────────────────────────── */}
      <section className="blogs-hero">
        <div className="blogs-hero-bg" />
        <div className="blogs-hero-content">
          <span className="blogs-hero-label">Our Blog</span>
          <h1 className="blogs-hero-title">
            News, Tips &amp; <span className="blogs-hero-accent">Insights</span>
          </h1>
          <p className="blogs-hero-sub">
            Stay up to date with the latest IPTV news, streaming tips, and product updates.
          </p>
        </div>
      </section>

      <main className="blogs-main">
        {loading && (
          <div className="blogs-state">
            <div className="blogs-spinner" />
            <p>Loading posts…</p>
          </div>
        )}

        {!loading && error && (
          <div className="blogs-state">
            <i className="bi bi-wifi-off blogs-state-icon" />
            <p>Could not load blog posts. Please try again later.</p>
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="blogs-state">
            <i className="bi bi-journal-richtext blogs-state-icon" />
            <p>No blog posts yet. Check back soon!</p>
          </div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <>
            {/* ── Featured post ─────────────────────────────────── */}
            <div
              className="blogs-featured"
              onClick={() => navigate(`/blog/${featured.id}`)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/blog/${featured.id}`)}
            >
              <div className="blogs-featured-img-wrap">
                {featured.coverImage ? (
                  <img
                    src={getFileUrl(featured.coverImage)}
                    alt={featured.title}
                    className="blogs-featured-img"
                  />
                ) : (
                  <div className="blogs-featured-img blogs-no-cover">
                    <i className="bi bi-journal-richtext" />
                  </div>
                )}
                <span className="blogs-featured-badge">Featured</span>
              </div>
              <div className="blogs-featured-body">
                <span className="blogs-card-date">
                  <i className="bi bi-calendar3" /> {formatDate(featured.createdAt)}
                </span>
                <h2 className="blogs-featured-title">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="blogs-featured-excerpt">{featured.excerpt}</p>
                )}
                {!featured.excerpt && (
                  <p className="blogs-featured-excerpt">
                    {stripHtml(featured.content).slice(0, 200)}…
                  </p>
                )}
                {featured.media?.length > 0 && (
                  <span className="blogs-media-pill">
                    <i className="bi bi-images" /> {featured.media.length} media file{featured.media.length !== 1 ? "s" : ""}
                  </span>
                )}
                <button className="blogs-read-btn">
                  Read Article <i className="bi bi-arrow-right" />
                </button>
              </div>
            </div>

            {/* ── Grid ──────────────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="blogs-grid">
                {rest.map((blog) => (
                  <article
                    key={blog.id}
                    className="blogs-card"
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/blog/${blog.id}`)}
                  >
                    <div className="blogs-card-img-wrap">
                      {blog.coverImage ? (
                        <img
                          src={getFileUrl(blog.coverImage)}
                          alt={blog.title}
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
                        <i className="bi bi-calendar3" /> {formatDate(blog.createdAt)}
                      </span>
                      <h3 className="blogs-card-title">{blog.title}</h3>
                      <p className="blogs-card-excerpt">
                        {blog.excerpt || stripHtml(blog.content).slice(0, 120) + "…"}
                      </p>
                      <div className="blogs-card-footer">
                        {blog.media?.length > 0 && (
                          <span className="blogs-media-pill small">
                            <i className="bi bi-images" /> {blog.media.length}
                          </span>
                        )}
                        <span className="blogs-card-readmore">
                          Read more <i className="bi bi-arrow-right" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogsPage;
