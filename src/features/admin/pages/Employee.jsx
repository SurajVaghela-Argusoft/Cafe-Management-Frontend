import { useEffect, useState } from "react";
import StatusBadge from "../../../components/common/StatusBadge";
import axios from "../../../api";

const Employee = () => {
    const [employee, setEmployee] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [search, setSearch] = useState("");                 
    const [statusFilter, setStatusFilter] = useState("all");  

    useEffect(() => {
        const getEmployees = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://127.0.0.1:8000/admin/getallemployee`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                setEmployee(response.data.data || []);
            } catch (err) {
                console.error("Error fetching employee data:", err);
            }
        };
        getEmployees();
    }, []);

    const handleToggleStatus = async (emp, isActive) => {
        const action = isActive ? "deactivate" : "activate";
        if (!window.confirm(`Do you want to ${action} ${emp.name}?`)) return;

        try {
            setUpdatingId(emp.employee_id);
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `http://127.0.0.1:8000/admin/toggleemployeestatus/${emp.employee_id}`,
                {},
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            const updated = response.data.data;
            setEmployee(prev =>
                prev.map(e =>
                    e.employee_id === emp.employee_id
                        ? { ...e, employee_status: updated.employee_status, last_date: updated.last_date }
                        : e
                )
            );
        } catch (err) {
            console.error("Error updating employee status:", err);
            alert(err.response?.data?.error?.message || "Could not update employee status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const statusOptions = [
        ...new Set(employee.map((e) => e.employee_status).filter(Boolean)),
    ];

    const q = search.trim().toLowerCase();
    const filteredEmployees = employee.filter((e) => {
        const matchesName = (e.name || "").toLowerCase().includes(q);
        const matchesStatus =
            statusFilter === "all" ||
            (e.employee_status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchesName && matchesStatus;
    });

    const hasFilters = search.trim() !== "" || statusFilter !== "all";

    if (employee.length === 0) { return <h2>No Employee Available</h2> }

    return (
        <div className="container py-4 bg-secondary-subtle rounded-4 mt-3 px-4">
            {/* NEW: filter bar */}
            <div className="row g-2 mb-3">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control rounded-3 shadow-sm py-2 px-3"
                        placeholder="Search employee by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select rounded-3 shadow-sm py-2 px-3"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-1">
                    <button
                        type="button"
                        className="btn btn-outline-dark w-100 rounded-3 py-2"
                        disabled={!hasFilters}
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="table-responsive bg-white rounded-4 p-4">
                <table className="table table-hover align-middle mb-0">
                    <thead>
                        <tr className="border-bottom border-dark">
                            <th className="text-muted fw-semibold small text-center">No.</th>
                            <th className="text-dark fw-bold small">Employee Name</th>
                            <th className="text-dark fw-bold small">Joining Date</th>
                            <th className="text-dark fw-bold small">Status</th>
                            <th className="text-dark fw-bold small text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                    No employees match your search or filter.
                                </td>
                            </tr>
                        )}

                        {filteredEmployees.map((emp, idx) => {
                            const isActive = emp.employee_status?.toLowerCase() === 'active';
                            const isUpdating = updatingId === emp.employee_id;

                            return (
                                <tr key={emp.employee_id} className="border-bottom border-light-subtle">
                                    <td className="text-muted text-center fw-medium small">
                                        {idx + 1}
                                    </td>

                                    <td className="text-dark fw-semibold">
                                        {emp.name}
                                    </td>

                                    <td className="text-secondary small">
                                        {emp.joining_date}
                                    </td>

                                    <td>
                                        <StatusBadge active={isActive}>{emp.employee_status}</StatusBadge>
                                    </td>

                                    <td className="text-end">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(emp, isActive)}
                                            disabled={isUpdating}
                                            className={`btn btn-sm rounded-2 px-3 fw-semibold ${isActive ? "btn-outline-danger" : "btn-outline-success"}`}
                                            style={{ fontSize: "0.8rem" }}
                                        >
                                            {isUpdating ? "Updating..." : isActive ? "Make Inactive" : "Make Active"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Employee;