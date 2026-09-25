import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminSubscriptions from "../../components/admin/Subscriptions";
import "../../assets/css/admin/dashboard.css";

const SubscriptionsPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Subscriptions" />
        <AdminSubscriptions />
      </div>
    </>
  );
};

export default SubscriptionsPage;
