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
  headers: { Authorization: `Bearer ${Cookies.get("token")}`},
});

const pad = (n) => String(n).padStart(2, "0");

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

const hoursWorked = (r) =>
  r.out_time ? (new Date(r.out_time) - new Date(r.in_time)) / 36e5 : 0;

const formatDuration = (hours) => {
  const totalMin = Math.round(hours * 60);
  return `${Math.floor(totalMin / 60)}h ${pad(totalMin % 60)}m`;
};

const timeOnly = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const AdminAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [employeeId, setEmployeeId] = useState(""); 
  const [month, setMonth] = useState(currentMonth()); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  const getError = (err, fallback) => {
    const d = err.response?.data;
    return d?.error?.message || (typeof d?.detail === "string" ? d.detail : fallback);
  };

  // employee dropdown 
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(`${API}/admin/getallemployee`, authHeader());
        setEmployees(res.data.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // attendance (reloads whenever a filter changes)
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setMessage({ text: "", type: "" });
        const params = {};
        if (employeeId) params.employee_id = employeeId;
        if (month) params.month = month;

        const res = await axios.get(`${API}/admin/getattendance`, { params, ...authHeader() });
        setRecords(res.data.data || []);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        setMessage({ text: getError(err, "Failed to load attendance."), type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [employeeId, month]);


  const totalHours = records.reduce((sum, r) => sum + hoursWorked(r), 0);
  const checkedInNow = records.filter((r) => !r.out_time).length;


  const perEmployee = Object.values(
    records.reduce((acc, r) => {
      if (!acc[r.employee_id]) {
        acc[r.employee_id] = { id: r.employee_id, name: r.employee_name, days: new Set(), hours: 0 };
      }
      acc[r.employee_id].days.add(r.in_time.slice(0, 10));
      acc[r.employee_id].hours += hoursWorked(r);
      return acc;
    }, {})
  );

  return (
    <ListPage>
      <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>Attendance Report</h2>
          <p className="text-muted small mb-0">Check-in and check-out history of all staff</p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <select className="form-select form-select-sm w-auto" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>{emp.name}</option>
            ))}
          </select>
          <input type="month" className="form-control form-control-sm w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
          {month && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setMonth("")}>All Months</button>
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
          <div className="text-muted small mb-1">Total Records</div>
          <div className="fs-3 fw-bold text-dark">{records.length}</div>
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
          <div className="text-muted small mb-1">Still Checked In</div>
          <div className="fs-3 fw-bold text-dark">{checkedInNow}</div>
        </div>
      </div>

      {/* Per-employee totals */}
      {!employeeId && perEmployee.length > 0 && (
        <div className="col-12">
          <div className="table-responsive bg-white rounded-4 p-4 shadow-sm">
            <h6 className="fw-bold text-dark mb-3">Summary by Employee</h6>
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr className="border-bottom border-dark">
                  <th className="text-dark fw-bold small">Employee</th>
                  <th className="text-dark fw-bold small">Days Present</th>
                  <th className="text-dark fw-bold small text-end">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {perEmployee.map((p) => (
                  <tr key={p.id} className="border-bottom border-light-subtle">
                    <td className="text-dark fw-semibold">{p.name}</td>
                    <td>{p.days.size}</td>
                    <td className="text-end">{formatDuration(p.hours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All records */}
      <div className="col-12">
        {loading ? (
          <EmptyState variant="card" text="Loading attendance..." />
        ) : records.length === 0 ? (
          <EmptyState variant="card" text="No attendance records found." />
        ) : (
          <div className="table-responsive bg-white rounded-4 p-4 shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-dark">
                  <th className="text-muted fw-semibold small text-center">#</th>
                  <th className="text-dark fw-bold small">Employee</th>
                  <th className="text-dark fw-bold small">Date</th>
                  <th className="text-dark fw-bold small">Check In</th>
                  <th className="text-dark fw-bold small">Check Out</th>
                  <th className="text-dark fw-bold small">Hours</th>
                  <th className="text-dark fw-bold small text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={r.attendance_id} className="border-bottom border-light-subtle">
                    <td className="text-muted text-center small">{idx + 1}</td>
                    <td className="text-dark fw-semibold">{r.employee_name}</td>
                    <td>{new Date(r.in_time).toLocaleDateString()}</td>
                    <td>{timeOnly(r.in_time)}</td>
                    <td>{r.out_time ? timeOnly(r.out_time) : "-"}</td>
                    <td>{r.out_time ? formatDuration(hoursWorked(r)) : "Working..."}</td>
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

export default AdminAttendance;