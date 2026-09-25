import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminHeroSection from "../../components/admin/HeroSection";
import "../../assets/css/admin/dashboard.css";

const HeroSectionPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Hero Section" />
        <AdminHeroSection />
      </div>
    </>
  );
};

export default HeroSectionPage;
