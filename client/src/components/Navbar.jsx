import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="brand-icon">E</div>

          <div className="brand-text">
            <span className="brand-name">ERP Keeper</span>
            <span className="brand-subtitle">Session Manager</span>
          </div>
        </button>
      </div>

      <div className="navbar-right">
        {user?.email && (
          <span className="navbar-email">
            {user.email}
          </span>
        )}

        <button
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;