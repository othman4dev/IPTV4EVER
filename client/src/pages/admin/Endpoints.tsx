import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminEndpoints from "../../components/admin/Endpoints";
import "../../assets/css/admin/dashboard.css";

const EndpointsPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Endpoints" />
        <AdminEndpoints />
      </div>
    </>
  );
};

export default EndpointsPage;
