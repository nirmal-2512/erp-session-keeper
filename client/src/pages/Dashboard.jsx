import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [cookies, setCookies] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const handleSaveSession = async (e) => {
    e.preventDefault();

    if (!cookies.trim()) {
      setError("Please enter your ERP session cookies.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await api.post("/erp/session", {
        cookies: cookies.trim(),
      });

      if (response.data.success) {
        setConnected(true);
        setCookies("");
        setMessage("ERP session saved securely.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save ERP session."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-container">

          <div className="dashboard-header">
            <div>
              <h2>ERP Keeper</h2>
              <p>Keep your IIT KGP ERP session active.</p>
            </div>

            <div className={`status-badge ${connected ? "active" : ""}`}>
              <span></span>
              {connected ? "Connected" : "Not Connected"}
            </div>
          </div>

          <div className="dashboard-card">

            <h3>ERP Session</h3>

            <p className="card-description">
              Add your ERP session cookies to enable automatic
              session keep-alive.
            </p>

            <form onSubmit={handleSaveSession}>

              <div className="form-group">
                <label>ERP Session Cookies</label>

                <textarea
                  value={cookies}
                  onChange={(e) => setCookies(e.target.value)}
                  placeholder="Paste your ERP session cookies here"
                  rows={6}
                />
              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="form-success">
                  {message}
                </div>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save ERP Session"}
              </button>

            </form>
          </div>

          <div className="dashboard-card">

            <h3>Keep-Alive Status</h3>

            <div className="status-row">
              <span>Status</span>
              <strong>
                {connected ? "Active" : "Not configured"}
              </strong>
            </div>

            <div className="status-row">
              <span>Last Keep-Alive</span>
              <strong>—</strong>
            </div>

          </div>

        </div>
      </main>
    </>
  );
}

export default Dashboard;