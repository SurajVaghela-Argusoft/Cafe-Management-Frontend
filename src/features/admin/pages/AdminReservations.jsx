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

const getStatus = (r) => {
  if (r.cancelled_at) return "Cancelled";
  if (new Date(r.end_time) < new Date()) return "Completed";
  if (new Date(r.reserved_for_time) <= new Date()) return "Ongoing";
  return "Upcoming";
};

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState(""); // empty = show all
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API}/admin/getreservations`, authHeader());
      setReservations(res.data.data || []);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setMessage({ text: "Failed to load reservations.", type: "error" });
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await axios.patch(`${API}/admin/cancelreservation/${id}`, {}, authHeader());
      setMessage({ text: "Reservation cancelled.", type: "success" });
      fetchReservations();
    } catch (err) {
      const d = err.response?.data;
      setMessage({ text: d?.error?.message || (typeof d?.detail === "string" ? d.detail : "Could not cancel."), type: "error" });
    }
  };

  const visible = dateFilter
    ? reservations.filter((r) => r.reserved_for_time.startsWith(dateFilter))
    : reservations;

  return (
    <ListPage>
      <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>All Reservations</h2>
          <p className="text-muted small mb-0">View and cancel table reservations</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <input type="date" className="form-control form-control-sm" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          {dateFilter && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setDateFilter("")}>Clear</button>
          )}
        </div>
      </div>

      {message.text && (
        <div className="col-12">
          <AlertMessage message={message} />
        </div>
      )}

      <div className="col-12">
        {visible.length === 0 ? (
          <EmptyState variant="card" text="No reservations found." />
        ) : (
          <div className="table-responsive bg-white rounded-4 p-4 shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-dark">
                  <th className="text-muted fw-semibold small text-center">#</th>
                  <th className="text-dark fw-bold small">Customer</th>
                  <th className="text-dark fw-bold small">Table</th>
                  <th className="text-dark fw-bold small">Persons</th>
                  <th className="text-dark fw-bold small">Date & Time</th>
                  <th className="text-dark fw-bold small">Status</th>
                  <th className="text-dark fw-bold small text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r, idx) => {
                  const status = getStatus(r);
                  return (
                    <tr key={r.reservation_id} className="border-bottom border-light-subtle">
                      <td className="text-muted text-center small">{idx + 1}</td>
                      <td className="text-dark fw-semibold">{r.customer_name}</td>
                      <td>Table {r.table_number}</td>
                      <td>{r.total_person}</td>
                      <td className="text-secondary small">
                        {new Date(r.reserved_for_time).toLocaleString()} →{" "}
                        {new Date(r.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td><StatusBadge active={status === "Upcoming" || status === "Ongoing"}>{status}</StatusBadge></td>
                      <td className="text-end">
                        {(status === "Upcoming" || status === "Ongoing") && (
                          <button onClick={() => cancel(r.reservation_id)} className="btn btn-sm btn-outline-danger rounded-2 fw-semibold">
                            Cancel
                          </button>
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

export default AdminReservations;