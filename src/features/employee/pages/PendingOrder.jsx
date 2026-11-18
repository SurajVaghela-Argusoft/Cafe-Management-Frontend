import { useState, useEffect, useContext } from "react";
// import axios from "axios";
import axios from "../../../api";
import Cookies from "js-cookie"; 
import { itemsContext } from "../../../context/ItemsContext";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import IndexBadge from "../../../components/common/IndexBadge";
import ListPage from "../../../components/common/ListPage";
import OrderItemRow from "../../../components/common/OrderItemRow";
import StatusBadge from "../../../components/common/StatusBadge";

const API = "http://127.0.0.1:8000";
const REFRESH_MS = 5000; // refresh every 5 seconds

const authHeader = () => ({
  headers: { Authorization: `Bearer ${Cookies.get("token")}` },
});

const PendingOrder = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [markingId, setMarkingId] = useState(null); // order being marked ready
  const dbitems = useContext(itemsContext) || [];

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get(`${API}/employee/allpendingorder`, authHeader());
      setOrders(res.data.data || []);
      setMessage((prev) => (prev.type === "error" ? { text: "", type: "" } : prev));
    } catch (err) {
      console.error("Error fetching pending orders:", err);
      const d = err.response?.data;
      setMessage({
        text: d?.error?.message || (typeof d?.detail === "string" ? d.detail : "Failed to fetch pending orders."),
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  const handleMarkReady = async (orderId) => {
    try {
      setMarkingId(orderId);
      await axios.patch(`${API}/employee/successorder/${orderId}`, {}, authHeader());
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
      setMessage({ text: "Order marked as ready!", type: "success" });
    } catch (err) {
      console.error("Error updating order:", err);
      const d = err.response?.data;
      setMessage({
        text: d?.error?.message || (typeof d?.detail === "string" ? d.detail : "Failed to update order status."),
        type: "error",
      });
    } finally {
      setMarkingId(null);
    }
  };

  const finditem = (id) => dbitems.find((d) => d.item_id === id) || null;

  return (
    <ListPage>
      <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>
            Pending Orders
          </h2>
          <p className="text-muted small mb-0">Live Orders </p>
        </div>
        <StatusBadge active={orders.length > 0}>Live Orders: {orders.length}</StatusBadge>
      </div>

      {message.text && (
        <div className="col-12">
          <AlertMessage message={message} />
        </div>
      )}

      {orders.length === 0 ? (
        <div className="col-12">
          <EmptyState variant="card" text="No pending orders in the queue right now." />
        </div>
      ) : (
        orders.map((order, idx) => {
          const isMarking = markingId === order.order_id;

          return (
            <div key={order.order_id} className="col-12 col-lg-6">
              <div className="p-4 bg-white border-0 rounded-4 shadow-sm position-relative h-100 d-flex flex-column">
                <IndexBadge>{idx + 1}</IndexBadge>

                <h4 className="fw-bold text-dark mb-1 fs-5 pe-5" style={{ letterSpacing: "-0.3px" }}>
                  {order.customer_name || "Guest"}
                </h4>
                <p className="text-muted small mb-3">
                  Order #{order.order_id} ·{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Just now"}
                </p>

                <h6 className="fw-semibold text-dark small mb-2 opacity-50">Items Ordered</h6>
                <div className="d-flex flex-column gap-2 mb-4 flex-grow-1">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, i) => {
                      const details = finditem(item.item_id);
                      return (
                        <OrderItemRow
                          key={item.ordr_item_id || item.order_item_id || i}
                          index={i}
                          name={details?.item_name || item.item_name || item.name || "Unknown Item"}
                          quantity={item.quantity}
                          price={`Rs. ${item.price ?? details?.price ?? 0}`}
                        />
                      );
                    })
                  ) : (
                    <EmptyState variant="box" text="No item details available." />
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light-subtle">
                  <span className="text-dark fw-bold fs-6">
                    Total: Rs. {Number(order.total_amount).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMarkReady(order.order_id)}
                    disabled={isMarking}
                    className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-semibold border-0 shadow-sm"
                  >
                    {isMarking ? "Updating..." : "Mark Ready"}
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

export default PendingOrder;