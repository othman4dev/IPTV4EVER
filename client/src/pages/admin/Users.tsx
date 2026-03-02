import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminUsers from "../../components/admin/Users";
import "../../assets/css/admin/dashboard.css";

const UsersPage = () => {
    return (
        <>
            <AdminHeader />
            <div className="dashboard-content">
                <Sidebar active="Users" />
                <AdminUsers />
            </div>
        </>
    );
};

export default UsersPage;
