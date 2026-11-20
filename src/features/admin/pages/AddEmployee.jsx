import { useEffect, useState } from "react";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import ListPage from "../../../components/common/ListPage";

const getError = (err, fallback) => {
  const d = err.response?.data;
  return d?.error?.message || (typeof d?.detail === "string" ? d.detail : null) || fallback;
};

const AddEmployee = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/admin/getallcustomer");
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setMessage({ text: getError(err, "Failed to load users."), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const makeEmployee = async (user) => {
    if (!window.confirm(`Make ${user.name} an employee?`)) return;

    try {
      setActingId(user.user_id);
      setMessage({ text: "", type: "" });

      const res = await axios.patch("/admin/assignrole", {
        user_id: user.user_id,
        role: "employee",
      });

      setMessage({
        text: res.data?.message === "Already having same role"
          ? `${user.name} is already an employee.`
          : `${user.name} is now an employee.`,
        type: "success",
      });
      fetchCustomers();
    } catch (err) {
      console.error("Error assigning role:", err);
      setMessage({ text: getError(err, "Could not assign role."), type: "error" });
    } finally {
      setActingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const visible = customers.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
  );

  return (
    <ListPage>
      <div className="col-12">
        <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>Add Employee</h2>
        <p className="text-muted small mb-0">
          Select a registered user to promote to employee. The user must already have an account.
        </p>
      </div>

      {message.text && (
        <div className="col-12">
          <AlertMessage message={message} />
        </div>
      )}

      <div className="col-12">
        <input
          type="text"
          className="form-control rounded-3 shadow-sm py-2 px-3"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="col-12">
        {loading ? (
          <EmptyState variant="card" text="Loading users..." />
        ) : visible.length === 0 ? (
          <EmptyState variant="card" text="No users found." />
        ) : (
          <div className="table-responsive bg-white rounded-4 p-4 shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-dark">
                  <th className="text-muted fw-semibold small text-center">#</th>
                  <th className="text-dark fw-bold small">Name</th>
                  <th className="text-dark fw-bold small">Email</th>
                  <th className="text-dark fw-bold small">Phone</th>
                  <th className="text-dark fw-bold small text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u, idx) => (
                  <tr key={u.user_id} className="border-bottom border-light-subtle">
                    <td className="text-muted text-center small">{idx + 1}</td>
                    <td className="text-dark fw-semibold">{u.name}</td>
                    <td className="text-secondary small">{u.email}</td>
                    <td className="text-secondary small">{u.phone}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        onClick={() => makeEmployee(u)}
                        disabled={actingId === u.user_id}
                        className="btn btn-dark btn-sm rounded-2 px-3 fw-semibold"
                      >
                        {actingId === u.user_id ? "Saving..." : "Make Employee"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ListPage>
  );
};

export default AddEmployee;


