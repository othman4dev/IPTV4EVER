import React from "react";
import { useState } from "react";
import "../../assets/css/admin/sidebar.css";

const navLinks = [
  { label: "Dashboard", icon: <i className="bi bi-speedometer2"></i>, href: "/admin/dashboard" },
  { label: "Users", icon: <i className="bi bi-people"></i>, href: "/admin/users" },
  { label: "Orders", icon: <i className="bi bi-bag"></i>, href: "/admin/orders" },
  { label: "Subscriptions", icon: <i className="bi bi-tv"></i>, href: "/admin/subscriptions" },
  { label: "Plans", icon: <i className="bi bi-list-check"></i>, href: "/admin/plans" },
  { label: "Pages", icon: <i className="bi bi-file-earmark"></i>, href: "/admin/pages" },
  { label: "Mail", icon: <i className="bi bi-envelope"></i>, href: "/admin/mail" },
  { label: "Chat", icon: <i className="bi bi-chat-dots"></i>, href: "/admin/chat" },
  { label: "Settings", icon: <i className="bi bi-gear"></i>, href: "/admin/settings" },
];

const Sidebar: React.FC<{ active?: string }> = ({ active }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside className={`admin-sidebar ${isMinimized ? 'sidebar-minimized' : ''}`}>
      <button className="minimize-sidebar" onClick={() => setIsMinimized(!isMinimized)}>
        <i className="bi bi-chevron-left"></i>
      </button>
      <nav className="admin-sidebar-nav">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`admin-sidebar-link${active === link.label ? " active" : ""}`}
          >
            {link.icon}
            <span style={{ marginLeft: 14 }}>{link.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;