// import axios from 'axios';
import axios from "../../../api";
import { useEffect, useState } from 'react';
import EmptyState from '../../../components/common/EmptyState';
import IndexBadge from '../../../components/common/IndexBadge';
import ListPage from '../../../components/common/ListPage';
import StatusBadge from '../../../components/common/StatusBadge';
import Cookies from 'js-cookie'

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);

  const getOrders = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");
      const token = Cookies.get("token");
      

      const response = await axios.get("http://127.0.0.1:8000/customer/getallorder", {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      console.log("Orders received successfully:", response.data);
      setOrders(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemsView = async (orderId) => {
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
      setItems([]);
      return;
    }

    try {
      setItemsLoading(true);
      setActiveOrderId(orderId);
      setItems([]);

      // const token = localStorage.getItem("token");
      const token = Cookies.get("token");
      
      const response = await axios.get(`http://127.0.0.1:8000/customer/getorderitembyid/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      console.log("Items fetched for order:", orderId, response.data);
      setItems(response.data.data || response.data || []);
    } catch (err) {
      console.error("Failed to load items:", err);
      alert("Could not load item details.");
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  if (loading || orders.length === 0) {
    return (
      <EmptyState
        fullHeight
        text={loading ? "Loading your kitchen orders..." : "You haven't placed any orders yet."}
      />
    );
  }

  return (
    <ListPage>
      <div className="col-12 mb-2">
        <h2 className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: "-0.5px" }}>Your Order History</h2>
        <p className="text-muted small">Track and view summaries of your past café transactions</p>
      </div>

      {orders.map((order, idx) => {
        const isCurrentActive = activeOrderId === order.order_id;
        const isCompleted = order.order_status?.toLowerCase() === 'completed';

        return (
          <div key={order.order_id || idx} className="col-12">
            <div className="p-4 bg-white border-0 rounded-4 shadow-sm position-relative">
              <IndexBadge>{idx + 1}</IndexBadge>

              <h4 className="fw-bold text-dark mb-1 fs-5" style={{ letterSpacing: "-0.3px" }}>
                Order Transaction
              </h4>
              <p className="text-muted small mb-3">
                {order.created_at ? new Date(order.created_at).toLocaleString() : "Date N/A"}
              </p>

              <div className="row g-2 mb-4 text-muted small">
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark fw-medium">Status:</strong>{" "}
                  <StatusBadge active={isCompleted}>{order.order_status}</StatusBadge>
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark fw-medium">Payment:</strong> {order.payment}
                </div>
                <div className="col-sm-12 col-md-6">
                  <strong className="text-dark fw-medium">Total Paid:</strong>{" "}
                  <span className="text-dark fw-bold fs-6">Rs. {Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleItemsView(order.order_id)}
                className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-semibold border-0 shadow-sm"
                style={{ fontSize: "0.85rem" }}
              >
                {isCurrentActive ? "Hide Details" : "View Items"}
              </button>
              {isCurrentActive && (
                <div className="mt-4 pt-4 border-top border-light-subtle d-flex flex-column gap-2">
                  <h6 className="fw-semibold text-dark fs-6 small mb-1 opacity-50">Order Breakdown</h6>

                  {itemsLoading ? (
                    <p className="text-muted small py-2 mb-0">Loading items...</p>
                  ) : items.length === 0 ? (
                    <EmptyState variant="box" text="No items found for this transaction." />
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {items.map((item, iIdx) => (
                        <div key={item.ordr_item_id || iIdx} className="bg-light px-3 rounded-3 border-0 d-flex align-items-center justify-content-between text-dark small">
                          <div>
                            <span className="text-muted me-2 fw-medium">{iIdx + 1}.</span>
                            <span className="fw-medium">Item Code: <strong className="text-dark">{item.item_id}</strong></span>
                          </div>
                          <div className="text-muted">
                            <span className="mx-2">Qty: <strong className="text-dark">{item.quantity}</strong></span>
                            <span className="ms-2">Price: <strong className="text-dark">Rs. {Number(item.price).toFixed(2)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        );
      })}
    </ListPage>
  );
}

export default OrderHistory;
