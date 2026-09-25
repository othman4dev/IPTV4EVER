import React from "react";
import { useState } from "react";
import "../../assets/css/admin/sidebar.css";

type SubLink = { label: string; icon: string; href: string };
type NavLink = { label: string; icon: string; href?: string; children?: SubLink[] };

const navLinks: NavLink[] = [
  { label: "Dashboard", icon: "bi-speedometer2", href: "/admin/dashboard" },
  { label: "Users",      icon: "bi-people",        href: "/admin/users" },
  { label: "Subscriptions", icon: "bi-tv",         href: "/admin/subscriptions" },
  { label: "Plans",      icon: "bi-list-check",     href: "/admin/plans" },
  { label: "Endpoints",  icon: "bi-link-45deg",    href: "/admin/endpoints" },
  {
    label: "SEO & Pages",
    icon: "bi-file-earmark-text",
    children: [
      { label: "Hero Section",  icon: "bi-window-stack",     href: "/admin/pages/hero" },
      { label: "Slides",        icon: "bi-images",           href: "/admin/pages/slides" },
      { label: "Announcements", icon: "bi-megaphone",        href: "/admin/pages/announcements" },
      { label: "Nav Links",     icon: "bi-signpost-2",       href: "/admin/pages/nav-links" },
      { label: "Feature Cards", icon: "bi-grid-3x3-gap",     href: "/admin/pages/features" },
      { label: "Testimonials",  icon: "bi-chat-square-quote",href: "/admin/pages/testimonials" },
      { label: "FAQ",           icon: "bi-question-circle",  href: "/admin/pages/faq" },
    ],
  },
  { label: "Blog",       icon: "bi-journal-richtext", href: "/admin/blog" },
  { label: "Mail",       icon: "bi-envelope",       href: "/admin/mail" },
  { label: "Chat",       icon: "bi-chat-dots",       href: "/admin/chat" },
  { label: "Settings",   icon: "bi-gear",            href: "/admin/settings" },
];

const PAGE_SUB_LABELS = ["Hero Section", "Slides", "Announcements", "Nav Links", "Feature Cards", "Testimonials", "FAQ"];

const Sidebar: React.FC<{ active?: string }> = ({ active }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  // Auto-expand Pages group if a sub-page is active
  const [pagesOpen, setPagesOpen] = useState(() =>
    PAGE_SUB_LABELS.includes(active ?? "")
  );

  return (
    <aside className={`admin-sidebar ${isMinimized ? "sidebar-minimized" : ""}`}>
      <button className="minimize-sidebar" onClick={() => setIsMinimized(!isMinimized)}>
        <i className="bi bi-chevron-left"></i>
      </button>
      <nav className="admin-sidebar-nav">
        {navLinks.map((link) => {
          if (link.children) {
            const isGroupActive = PAGE_SUB_LABELS.includes(active ?? "");
            return (
              <div key={link.label} className="sidebar-group">
                <button
                  className={`admin-sidebar-link sidebar-group-btn${isGroupActive ? " active" : ""}`}
                  onClick={() => setPagesOpen((o) => !o)}
                >
                  <i className={`bi ${link.icon}`}></i>
                  <span className="sidebar-link-label">{link.label}</span>
                  <i className={`bi bi-chevron-down sidebar-group-chevron${pagesOpen ? " open" : ""}`}></i>
                </button>
                {pagesOpen && !isMinimized && (
                  <div className="sidebar-sub-links">
                    {link.children.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        className={`sidebar-sub-link${active === sub.label ? " active" : ""}`}
                      >
                        <i className={`bi ${sub.icon}`}></i>
                        <span className="sidebar-sub-label">{sub.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <a
              key={link.label}
              href={link.href}
              className={`admin-sidebar-link${active === link.label ? " active" : ""}`}
            >
              <i className={`bi ${link.icon}`}></i>
              <span className="sidebar-link-label" style={{ marginLeft: 14 }}>{link.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;