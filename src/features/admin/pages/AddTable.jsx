import { useState, useEffect } from "react";
// import axios from "axios";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import FormField from "../../../components/common/FormField";
import Panel from "../../../components/common/Panel";
import ScrollArea from "../../../components/common/ScrollArea";
import SplitLayout from "../../../components/common/SplitLayout";
import Cookies from 'js-cookie'

const AddTable = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/user/gettable");
      setTables(response.data.data || response.data || []);
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tableNumber || !capacity) {
      setMessage({ text: "Please enter both table number and capacity.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      // const token = localStorage.getItem("token");
      const token = Cookies.get("token");

      await axios.post(
        "http://127.0.0.1:8000/admin/addtable",
        {
          table_number: Number(tableNumber),
          capacity: Number(capacity)
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      setMessage({ text: "Table added successfully!", type: "success" });
      setTableNumber("");
      setCapacity("");
      fetchTables();

    } catch (err) {
      console.error("Error creating table record item:", err);
      const errorMsg = err.response?.data?.error?.message || "Something went wrong. Please try again.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (tbl) => {
    if (!window.confirm(`Delete Table ${tbl.table_number}?`)) return;

    try {
      // const token = localStorage.getItem("token");
      const token = Cookies.get("token");

      await axios.delete(`http://127.0.0.1:8000/admin/deletetable/${tbl.table_id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      setMessage({ text: "Table deleted successfully!", type: "success" });
      fetchTables();
    } catch (err) {
      console.error("Error deleting table:", err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.detail || "Could not delete table.";
      setMessage({ text: errorMsg, type: "error" });
    }
  };

  const left = (
    <Panel title="Add New Dining Table" className="w-100">
      <AlertMessage message={message} />

      <form onSubmit={handleSubmit}>
        <FormField label="Table Number:" id="tableNumber" type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. 12" disabled={loading} min="1" required />
        <FormField label="Seating Capacity:" id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 4" className="mb-4" disabled={loading} min="1" required />

        <button type="submit" className="btn btn-dark w-100 fw-semibold border-0 shadow-sm" disabled={loading}>
          {loading ? "Saving..." : "Add Table"}
        </button>
      </form>
    </Panel>
  );

  const right = (
    <Panel title="Available Restaurant Tables" className="h-100 d-flex flex-column overflow-hidden">
      {tables.length === 0 ? (
        <EmptyState variant="box" text="No table layouts configured in database registry systems." />
      ) : (
        <ScrollArea>
          <div className="d-flex flex-column gap-3">
            {tables.map((tbl) => (
              <div key={tbl.table_id || tbl.table_number} className="p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center">
                <div className="text-dark small">
                  <strong className="text-dark d-block mb-1 fs-6">Table {tbl.table_number}</strong>
                  <span className="text-muted opacity-75">
                    Max Seats: <strong className="text-dark fw-semibold">{tbl.capacity}</strong>
                  </span>
                </div>
                               <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-muted border border-light-subtle rounded-2 px-2 shadow-sm fw-normal" style={{ fontSize: "0.75rem" }}>
                    Registered: {tbl.created_at ? new Date(tbl.created_at).toLocaleDateString() : "N/A"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tbl)}
                    className="btn btn-sm btn-outline-danger rounded-2 fw-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Panel>
  );

  return <SplitLayout left={left} right={right} />;
};

export default AddTable;
