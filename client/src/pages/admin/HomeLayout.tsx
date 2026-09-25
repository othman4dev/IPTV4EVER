import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminHomeLayout from "../../components/admin/HomeLayout";
import "../../assets/css/admin/dashboard.css";

const HomeLayoutPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Home Layout" />
        <AdminHomeLayout />
      </div>
    </>
  );
};

export default HomeLayoutPage;
