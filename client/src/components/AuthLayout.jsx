import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AuthLayout({ title, subtitle, children, footerText, footerLink, footerLinkText }) {
  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="brand">
          <div className="brand-icon">E</div>

          <div>
            <h1>ERP Keeper</h1>
            <p>Secure session management</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {children}

        <div className="auth-footer">
          <span>{footerText}</span>{" "}
          <Link to={footerLink}>{footerLinkText}</Link>
        </div>

      </div>

      <div className="developer-credit">
        Developed by Nirmal Patidar
      </div>
    </div>
  );
}

export default AuthLayout;