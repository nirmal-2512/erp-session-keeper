import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Email information is missing. Please register again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      if (response.data.success) {
        navigate("/login", {
          state: {
            email,
          },
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Verify your email</h2>

          <p>
            We've sent a verification code to
            <br />
            <strong>{email || "your email"}</strong>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Verification code</label>

            <input
              className="otp-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              required
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

        </form>

        <div className="resend-section">
          Didn't receive the code?
          <button type="button">
            Resend OTP
          </button>
        </div>

        <div className="auth-footer">
          <button
            className="back-button"
            type="button"
            onClick={() => navigate("/register")}
          >
            ← Back to registration
          </button>
        </div>

      </div>

      <div className="developer-credit">
        Developed by Nirmal Patidar
      </div>
    </div>
  );
}

export default VerifyOTP;