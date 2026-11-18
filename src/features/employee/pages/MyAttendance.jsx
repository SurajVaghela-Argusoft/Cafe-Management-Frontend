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

const pad = (n) => String(n).padStart(2, "0");

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

const hoursWorked = (r) => {
  if (!r.out_time) return null;
  return (new Date(r.out_time) - new Date(r.in_time)) / 36e5;
};

const formatDuration = (hours) => {
  if (hours === null) return "Working...";
  const totalMin = Math.round(hours * 60);
  return `${Math.floor(totalMin / 60)}h ${pad(totalMin % 60)}m`;
};

const timeOnly = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(currentMonth()); // empty string = show all
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${API}/employee/myattendance`, authHeader());
        setRecords(res.data.data || []);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        const d = err.response?.data;
        setMessage({
          text: d?.error?.message || (typeof d?.detail === "string" ? d.detail : "Failed to load attendance."),
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const visible = month ? records.filter((r) => r.in_time.startsWith(month)) : records;

  const daysPresent = new Set(visible.map((r) => r.in_time.slice(0, 10))).size;
  const totalHours = visible.reduce((sum, r) => sum + (hoursWorked(r) || 0), 0);
  const stillWorking = visible.some((r) => !r.out_time);

  return (
    <ListPage>
      <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>My Attendance</h2>
          <p className="text-muted small mb-0">Your check-in and check-out history</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <input type="month" className="form-control form-control-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
          {month && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setMonth("")}>Show All</button>
          )}
        </div>
      </div>

      {message.text && (
        <div className="col-12">
          <AlertMessage message={message} />
        </div>
      )}

      {/* Summary cards */}
      <div className="col-6 col-md-4">
        <div className="p-4 bg-white rounded-4 shadow-sm text-center">
          <div className="text-muted small mb-1">Days Present</div>
          <div className="fs-3 fw-bold text-dark">{daysPresent}</div>
        </div>
      </div>
      <div className="col-6 col-md-4">
        <div className="p-4 bg-white rounded-4 shadow-sm text-center">
          <div className="text-muted small mb-1">Total Hours</div>
          <div className="fs-3 fw-bold text-dark">{formatDuration(totalHours)}</div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="p-4 bg-white rounded-4 shadow-sm text-center">
          <div className="text-muted small mb-1">Current Status</div>
          <div className="fs-5 fw-bold mt-2">
            <StatusBadge active={stillWorking}>{stillWorking ? "Checked In" : "Checked Out"}</StatusBadge>
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="col-12">
        {loading ? (
          <EmptyState variant="card" text="Loading attendance..." />
        ) : visible.length === 0 ? (
          <EmptyState variant="card" text="No attendance records found." />
        ) : (
          <div className="table-responsive bg-white rounded-4 p-4 shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-dark">
                  <th className="text-muted fw-semibold small text-center">#</th>
                  <th className="text-dark fw-bold small">Date</th>
                  <th className="text-dark fw-bold small">Check In</th>
                  <th className="text-dark fw-bold small">Check Out</th>
                  <th className="text-dark fw-bold small">Hours</th>
                  <th className="text-dark fw-bold small text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r, idx) => (
                  <tr key={r.attendance_id} className="border-bottom border-light-subtle">
                    <td className="text-muted text-center small">{idx + 1}</td>
                    <td className="text-dark fw-semibold">{new Date(r.in_time).toLocaleDateString()}</td>
                    <td>{timeOnly(r.in_time)}</td>
                    <td>{r.out_time ? timeOnly(r.out_time) : "-"}</td>
                    <td>{formatDuration(hoursWorked(r))}</td>
                    <td className="text-end">
                      <StatusBadge active={!r.out_time}>{r.out_time ? "Completed" : "Working"}</StatusBadge>
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

export default MyAttendance;


