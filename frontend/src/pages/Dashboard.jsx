import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearAuth, getUserId, getUserName } from "../services/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = getUserId();
  const userName = getUserName();

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    currency: "USD",
    frequency: "monthly",
    category: "entertainment",
    paymentMethod: "",
    startDate: todayISO(),
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim() &&
      form.price !== "" &&
      form.paymentMethod.trim() &&
      form.startDate
    );
  }, [form]);

  const loadSubs = async () => {
    if (!userId) {
      setError("Missing user id. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch(`/subscriptions/user/${userId}`);
      setSubs(data.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setCreating(true);
      const payload = {
        ...form,
        price: Number(form.price),
      };
      await apiFetch("/subscriptions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setForm((prev) => ({ ...prev, name: "", price: "", paymentMethod: "" }));
      await loadSubs();
    } catch (err) {
      setError(err.message || "Create subscription failed");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="page dashboard">
      <header className="header">
        <div>
          <h1>Subscriptions</h1>
          <p className="muted">
            {userName ? `Welcome, ${userName}.` : "Your personal subscriptions"}
          </p>
        </div>
        <button className="ghost" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Create subscription</h2>
          <form onSubmit={handleCreate} className="form">
            <label>
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Netflix"
                required
              />
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="9.99"
                required
              />
            </label>

            <label>
              Currency
              <select name="currency" value={form.currency} onChange={handleChange}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>

            <label>
              Frequency
              <select name="frequency" value={form.frequency} onChange={handleChange}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>

            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="sports">Sports</option>
                <option value="news">News</option>
                <option value="entertainment">Entertainment</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="politics">Politics</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Payment method
              <input
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                placeholder="Visa"
                required
              />
            </label>

            <label>
              Start date
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit" disabled={!canSubmit || creating}>
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Your subscriptions</h2>
            <button className="ghost" onClick={loadSubs} disabled={loading}>
              Refresh
            </button>
          </div>

          {error && <div className="alert">{error}</div>}

          {loading ? (
            <p className="muted">Loading...</p>
          ) : subs.length === 0 ? (
            <p className="muted">No subscriptions yet.</p>
          ) : (
            <ul className="list">
              {subs.map((sub) => (
                <li key={sub._id} className="list-item">
                  <div>
                    <strong>{sub.name}</strong>
                    <div className="muted small">
                      {sub.currency} {sub.price} · {sub.frequency}
                    </div>
                    <div className="muted small">
                      Renewal: {new Date(sub.renewalDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`tag ${sub.status}`}>{sub.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
