import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminAnnouncements from "../../components/admin/Announcements";
import "../../assets/css/admin/dashboard.css";

const AnnouncementsPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Announcements" />
        <AdminAnnouncements />
      </div>
    </>
  );
};

export default AnnouncementsPage;
