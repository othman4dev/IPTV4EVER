import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import "../../assets/css/admin/dashboard.css";

const Dashboard = () => {
    return (
        <>
            <AdminHeader />
            <div className="dashboard-content">
                <Sidebar active="dashboard" />
                <div className="dashboard-main">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome to the admin dashboard. Here you can manage users, view analytics, and configure settings.</p>
                </div>
            </div>
        </>
    )
}

export default Dashboard;