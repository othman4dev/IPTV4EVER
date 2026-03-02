import "../../assets/css/admin/admin-header.css"
import logo from "../../assets/images/iptv4ever-logo.svg";

const AdminHeader = () => {
    return (
        <header className="admin-header">
            <div className="header-logo">
                <img src={logo} className="header-logo-img" alt="IPTV4EVER Logo" />
            </div>
            <nav className="admin-nav">
                <div className="nav-search">
                    <input type="text" name="search" className="search-input" id="search-input" placeholder="Search..." />
                    <i className="bi bi-search"></i>
                </div>
                <div className="nav-item">
                    <i className="bi bi-bell"></i>
                </div>
                <div className="nav-item">
                    <i className="bi bi-person-circle"></i>
                </div>
                {/* <div className="nav-item">
                    <i className="bi bi-gear-fill"></i>
                </div>
                <div className="nav-item">
                    <i className="bi bi-box-arrow-right"></i>
                </div> */}
            </nav>
        </header>
    )
}

export default AdminHeader;