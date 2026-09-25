import AdminHeader from "../../components/admin/AdminHeader";
import Sidebar from "../../components/admin/Sidebar";
import AdminBlogs from "../../components/admin/Blogs";
import "../../assets/css/admin/dashboard.css";

const BlogsPage = () => {
  return (
    <>
      <AdminHeader />
      <div className="dashboard-content">
        <Sidebar active="Blog" />
        <AdminBlogs />
      </div>
    </>
  );
};

export default BlogsPage;
