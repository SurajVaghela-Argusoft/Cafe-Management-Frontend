import { useState, useEffect } from "react";
// import axios from "axios";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import ListPage from "../../../components/common/ListPage";
import StatusBadge from "../../../components/common/StatusBadge";
import Cookies from 'js-cookie'

const EmployeeAttendance = () => {
    const [employees, setEmployees] = useState([]);
    const [alertMessage, setAlertMessage] = useState({ text: "", type: "" });
    const showAlert = (text, type) => {
        setAlertMessage({ text, type });
        setTimeout(() => setAlertMessage({ text: "", type: "" }), 5000);
    };

    const fetchEmployees = async () => {
        try {
            // const token = localStorage.getItem("token");
            const token = Cookies.get("token");
            
            const response = await axios.get("http://127.0.0.1:8000/admin/getallemployee", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployees(response.data.data || []);
        } catch (err) {
            console.error("Error fetching employees:", err);
            showAlert("Failed to load employee list from server.", "error");
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);


    const handleMarkAttendance = async (empId, type) => {
        try {
            // const token = localStorage.getItem("token");
            const token = Cookies.get("token");
            
            const currentTimeString = new Date().toISOString();

            let payload = {};
            if (type === "checkin") {
                payload = {
                    employee_id: empId,
                    in_time: currentTimeString,
                    out_time: null
                };
            } else if (type === "checkout") {
                payload = {
                    employee_id: empId,
                    in_time: new Date(Date.now() - 1000 * 60).toISOString(),
                    out_time: currentTimeString
                };
            }

            const response = await axios.post(
                "http://127.0.0.1:8000/admin/markattendance",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            showAlert(
                `Successfully logged ${type === "checkin" ? "Check In" : "Check Out"} for Employee ID #${empId}!`,
                "success"
            );

        } catch (err) {
            console.error(`Error processing ${type}:`, err);
            const errorDetail = err.response?.data?.error?.message || `Could not complete the ${type} request.`;
            showAlert(`Error: ${errorDetail}`, "error");
        }
    };

    return (
        <ListPage>
            <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <div>
                    <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>Staff Attendance Dashboard</h2>
                    <p className="text-muted small mb-0">Manage daily check-ins nd check-outs for active personnel</p>
                </div>
            </div>

            {alertMessage.text && (
                <div className="col-12">
                    <AlertMessage message={alertMessage} />
                </div>
            )}

            {employees.length === 0 ? (
                <div className="col-12">
                    <EmptyState variant="card" text="No employees configured in the database system." />
                </div>
            ) : (
                employees.map((emp, idx) => {
                    const isActive = emp.employee_status?.toLowerCase() === "active";

                    return (
                        <div key={emp.employee_id} className="col-12">
                            <div className="p-4 bg-white border-0 rounded-4 shadow-sm position-relative d-flex justify-content-between align-items-center flex-wrap gap-4">

                                <div className="d-flex align-items-center gap-3">
                                    <span className="badge bg-light text-dark border border-light-subtle rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px", fontSize: "0.85rem" }}>
                                        {idx + 1}
                                    </span>

                                    <div>
                                        <h4 className="fw-bold text-dark mb-1 fs-5" style={{ letterSpacing: "-0.3px" }}>
                                            {emp.name}
                                        </h4>
                                        <div className="d-flex flex-wrap gap-3 text-muted small align-items-center">
                                            <span><strong className="text-dark fw-medium">ID:</strong> {emp.employee_id}</span>
                                            <span className="text-light-subtle">|</span>
                                            <span><strong className="text-dark fw-medium">Joined:</strong> {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : "N/A"}</span>
                                            <span className="text-light-subtle">|</span>
                                            <StatusBadge active={isActive}>{emp.employee_status}</StatusBadge>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        onClick={() => handleMarkAttendance(emp.employee_id, "checkin")}
                                        className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-semibold border-0 shadow-sm"
                                        disabled={!isActive}
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        Check In
                                    </button>

                                    <button
                                        onClick={() => handleMarkAttendance(emp.employee_id, "checkout")}
                                        className="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 fw-semibold text-dark border-light-subtle shadow-sm bg-white"
                                        disabled={!isActive}
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        Check Out
                                    </button>
                                </div>

                            </div>
                        </div>
                    );
                })
            )}
        </ListPage>
    );
};

export default EmployeeAttendance;
