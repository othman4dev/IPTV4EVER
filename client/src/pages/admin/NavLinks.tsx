import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import "../../assets/css/admin/dashboard.css";

const NavLinksPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Nav Links" />
        <div className="admin-plans" style={{ flex: 1, padding: "2rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Nav Links
          </h1>
          <p style={{ color: "#888" }}>This section is coming soon.</p>
        </div>
      </div>
    </>
  );
};

export default NavLinksPage;
