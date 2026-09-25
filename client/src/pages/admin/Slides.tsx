import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminSlides from "../../components/admin/Slides";
import "../../assets/css/admin/dashboard.css";

const SlidesPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Slides" />
        <AdminSlides />
      </div>
    </>
  );
};

export default SlidesPage;
