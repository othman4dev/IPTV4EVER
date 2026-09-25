import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import "../../assets/css/admin/dashboard.css";

const FeatureCardsPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Feature Cards" />
        <div className="admin-plans" style={{ flex: 1, padding: "2rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Feature Cards
          </h1>
          <p style={{ color: "#888" }}>This section is coming soon.</p>
        </div>
      </div>
    </>
  );
};

export default FeatureCardsPage;
