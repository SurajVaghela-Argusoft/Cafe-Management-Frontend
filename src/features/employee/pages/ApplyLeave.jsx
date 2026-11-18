import { useEffect, useState } from "react";
// import axios from "axios";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import FormField from "../../../components/common/FormField";
import Panel from "../../../components/common/Panel";
import ScrollArea from "../../../components/common/ScrollArea";
import SplitLayout from "../../../components/common/SplitLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import Cookies from 'js-cookie'

const API = "http://127.0.0.1:8000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${Cookies.get("token")}` },
});

const pad = (n) => String(n).padStart(2, "0");

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// number of days between two "YYYY-MM-DD" dates, both days included
const countDays = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000) + 1;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const getError = (err, fallback) => {
  const d = err.response?.data;
  return d?.error?.message || (typeof d?.detail === "string" ? d.detail : null) || fallback;
};

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState(todayStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API}/employee/myleaves`, authHeader());
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setMessage({ text: getError(err, "Failed to load your leaves."), type: "error" });
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    if (endDate < value) setEndDate(value); // keep end date valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!leaveType) {
      setMessage({ text: "Please select a leave type.", type: "error" });
      return;
    }
    if (endDate < startDate) {
      setMessage({ text: "End date cannot be before start date.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      await axios.post(
        `${API}/employee/applyleave`,
        { leave_type: leaveType, start_date: startDate, end_date: endDate },
        authHeader()
      );

      setMessage({ text: "Leave request submitted!", type: "success" });
      setLeaveType("");
      setStartDate(todayStr());
      setEndDate(todayStr());
      fetchLeaves();
    } catch (err) {
      console.error("Error applying leave:", err);
      setMessage({ text: getError(err, "Could not submit leave request."), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const left = (
    <Panel title="Apply for Leave" subtitle="Choose the type and dates of your leave" className="w-100">
      <AlertMessage message={message} />

      <form onSubmit={handleSubmit}>
        <FormField as="select" label="Leave Type:" id="leaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} disabled={loading} required>
          <option value="">-- Select Leave Type --</option>
          <option value="sick">Sick</option>
          <option value="social">Social</option>
          <option value="restricted">Restricted</option>
        </FormField>

        <FormField label="From Date:" id="startDate" type="date" min={todayStr()} value={startDate} onChange={handleStartChange} disabled={loading} required />
        <FormField label="To Date:" id="endDate" type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mb-3" disabled={loading} required />

        <p className="text-muted small mb-4">
          Total days: <strong className="text-dark">{endDate >= startDate ? countDays(startDate, endDate) : 0}</strong>
        </p>

        <button type="submit" className="btn btn-dark w-100 fw-semibold border-0 shadow-sm" disabled={loading}>
          {loading ? "Submitting..." : "Apply Leave"}
        </button>
      </form>
    </Panel>
  );

  const right = (
    <Panel title="My Leave Requests" className="h-100 d-flex flex-column overflow-hidden">
      {leaves.length === 0 ? (
        <EmptyState variant="box" text="You have not applied for any leave yet." />
      ) : (
        <ScrollArea>
          <div className="d-flex flex-column gap-3">
            {leaves.map((l) => (
              <div key={l.leave_id} className="p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div className="text-dark small">
                  <strong className="text-dark d-block mb-1 fs-6">{capitalize(l.leave_type)} Leave</strong>
                  <span className="text-muted d-block">
                    {new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}
                    {" "}({countDays(l.start_date, l.end_date)} day{countDays(l.start_date, l.end_date) > 1 ? "s" : ""})
                  </span>
                  <span className="text-muted opacity-75">
                    Applied on {new Date(l.created_at).toLocaleDateString()}
                  </span>
                </div>
                <StatusBadge active={l.status === "approved"}>{capitalize(l.status)}</StatusBadge>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Panel>
  );

  return <SplitLayout left={left} right={right} />;
};

export default ApplyLeave;