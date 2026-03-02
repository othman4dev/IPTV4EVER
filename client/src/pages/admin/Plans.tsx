import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminPlans from "../../components/admin/Plans";
import "../../assets/css/admin/dashboard.css";

const PlansPage = () => {
    return (
        <>
            <AdminHeader />
            <div className="dashboard-content">
                <Sidebar active="Plans" />
                <AdminPlans />
            </div>
        </>
    );
};

export default PlansPage;
