import { useEffect, useState } from "react";
// import axios from "axios";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import ListPage from "../../../components/common/ListPage";
import StatusBadge from "../../../components/common/StatusBadge";
import Cookies from 'js-cookie'

const API = "http://127.0.0.1:8000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${Cookies.get("token")}` },
});

const countDays = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000) + 1;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const getError = (err, fallback) => {
  const d = err.response?.data;
  return d?.error?.message || (typeof d?.detail === "string" ? d.detail : null) || fallback;
};

const FILTERS = ["pending", "approved", "rejected", "all"];

const LeaveStatusBadge = ({ status }) => {
  if (status === "rejected") {
    return (
      <span className="rounded-2 px-2 py-1 small fw-medium border bg-danger-subtle text-danger border-danger-subtle">
        Rejected
      </span>
    );
  }
  return <StatusBadge active={status === "approved"}>{capitalize(status)}</StatusBadge>;
};

const ManageLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API}/admin/getleaves`, authHeader());
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setMessage({ text: getError(err, "Failed to load leave requests."), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleDecision = async (leave, decision) => {
    if (
      decision === "rejected" &&
      !window.confirm(`Reject ${leave.employee_name}'s ${leave.leave_type} leave?`)
    ) {
      return;
    }

    try {
      setActingId(leave.leave_id);
      setMessage({ text: "", type: "" });
      await axios.patch(
        `${API}/admin/updateleavestatus/${leave.leave_id}`,
        { status: decision },
        authHeader()
      );
      setMessage({ text: `Leave ${decision} for ${leave.employee_name}.`, type: "success" });
    } catch (err) {
      console.error("Error updating leave:", err);
      setMessage({ text: getError(err, "Could not update the leave request."), type: "error" });
    } finally {
      setActingId(null);
      fetchLeaves();
    }
  };

  const countOf = (s) => leaves.filter((l) => l.status === s).length;

  let visible = filter === "all" ? leaves : leaves.filter((l) => l.status === filter);
  if (filter === "pending") visible = [...visible].reverse(); 

  return (
    <ListPage>
      <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>Leave Requests</h2>
          <p className="text-muted small mb-0">Approve or reject employee leave</p>
        </div>
        <div className="btn-group" role="group" aria-label="Filter leave requests">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`btn btn-sm ${filter === f ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setFilter(f)}
            >
              {capitalize(f)}
              {f !== "all" && ` (${countOf(f)})`}
            </button>
          ))}
        </div>
      </div>

      {message.text && (
        <div className="col-12">
          <AlertMessage message={message} />
        </div>
      )}

      <div className="col-12">
        {loading ? (
          <EmptyState variant="card" text="Loading leave requests..." />
        ) : visible.length === 0 ? (
          <EmptyState
            variant="card"
            text={filter === "all" ? "No leave requests yet." : `No ${filter} leave requests.`}
          />
        ) : (
          <div className="table-responsive bg-white rounded-4 p-4 shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-dark">
                  <th className="text-muted fw-semibold small text-center">#</th>
                  <th className="text-dark fw-bold small">Employee</th>
                  <th className="text-dark fw-bold small">Type</th>
                  <th className="text-dark fw-bold small">From</th>
                  <th className="text-dark fw-bold small">To</th>
                  <th className="text-dark fw-bold small">Days</th>
                  <th className="text-dark fw-bold small">Applied</th>
                  <th className="text-dark fw-bold small">Status</th>
                  <th className="text-dark fw-bold small text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((l, idx) => {
                  const busy = actingId === l.leave_id;
                  return (
                    <tr key={l.leave_id} className="border-bottom border-light-subtle">
                      <td className="text-muted text-center small">{idx + 1}</td>
                      <td className="text-dark fw-semibold">{l.employee_name}</td>
                      <td>{capitalize(l.leave_type)}</td>
                      <td>{new Date(l.start_date).toLocaleDateString()}</td>
                      <td>{new Date(l.end_date).toLocaleDateString()}</td>
                      <td>{countDays(l.start_date, l.end_date)}</td>
                      <td>{new Date(l.created_at).toLocaleDateString()}</td>
                      <td><LeaveStatusBadge status={l.status} /></td>
                      <td className="text-end">
                        {l.status === "pending" ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              className="btn btn-dark btn-sm fw-semibold"
                              disabled={busy}
                              onClick={() => handleDecision(l, "approved")}
                            >
                              {busy ? "Saving..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm fw-semibold"
                              disabled={busy}
                              onClick={() => handleDecision(l, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ListPage>
  );
};

export default ManageLeaves;