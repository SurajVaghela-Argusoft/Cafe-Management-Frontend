import axios from "../../../api";
import { useEffect, useState, useContext } from "react";
import { itemsContext } from "../../../context/ItemsContext";
import EmptyState from "../../../components/common/EmptyState";
import IndexBadge from "../../../components/common/IndexBadge";
import ListPage from "../../../components/common/ListPage";
import OrderItemRow from "../../../components/common/OrderItemRow";
import StatusBadge from "../../../components/common/StatusBadge";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [visibleItems, setVisibleItems] = useState({});
  const [search, setSearch] = useState("");          
  const [statusFilter, setStatusFilter] = useState("all");  
  const dbitems = useContext(itemsContext) || [];

  useEffect(() => {
    const getOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/admin/getorders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        setOrders(response.data.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    getOrders();
  }, []);

  const finditem = (id) => {
    if (!dbitems || dbitems.length === 0) return null;
    return dbitems.find(prev => prev.item_id === id);
  };

  const toggleItemsVisibility = (orderId) => {
    setVisibleItems(prevState => ({
      ...prevState,
      [orderId]: !prevState[orderId]
    }));
  };

 
  const statusOptions = [
    ...new Set(orders.map((o) => o.order_status).filter(Boolean)),
  ];

  const q = search.trim().toLowerCase();
  const filteredOrders = orders.filter((o) => {
    const matchesName = (o.customer_name || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || o.order_status === statusFilter;
    return matchesName && matchesStatus;
  });

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  return (
    <ListPage>
      <div className="col-12 mb-3">
        <div className="row g-2">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control rounded-3 shadow-sm py-2 px-3"
              placeholder="Search by customer name..."
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
      </div>

      {orders.length === 0 ? (
        <div className="col-12 text-center py-5">
          <EmptyState variant="card" text="No orders found in the system." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="col-12 text-center py-5">
          <EmptyState variant="card" text="No orders match your search or filter." />
        </div>
      ) : (
        filteredOrders.map((o, id) => {
          const isItemsVisible = visibleItems[o.order_id];

          return (
            <div key={o.order_id || id} className="col-12 p-4 bg-white border-0 rounded-4 shadow-sm position-relative">
              <IndexBadge>{id + 1}</IndexBadge>

              <h4 className="fw-bold text-dark mb-3 fs-5" style={{ letterSpacing: "-0.3px" }}>
                Customer: {o.customer_name}
              </h4>

              <div className="row g-2 mb-4 text-muted small">
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark fw-medium">Status:</strong>{" "}
                  <StatusBadge active={o.order_status?.toLowerCase() === 'completed'}>{o.order_status}</StatusBadge>
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark fw-medium">Created at:</strong> {o.created_at}
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark fw-medium">Total Amount:</strong> <span className="text-dark fw-semibold">Rs. {o.total_amount}</span>
                </div>
                <div className="col-sm-6 col-md-3">
                  <strong className="text-dark fw-medium">Payment:</strong> {o.payment}
                </div>
              </div>

              <button onClick={() => toggleItemsVisibility(o.order_id)} className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-medium border-0 shadow-sm">
                {isItemsVisible ? "Hide Items" : "Show Items"}
              </button>

              {isItemsVisible && (
                <div className="mt-4 pt-4 border-top border-light-subtle d-flex flex-column gap-2">
                  <h6 className="fw-semibold text-dark fs-6 small mb-1 opacity-50">Items Ordered</h6>

                  {o.items && o.items.map((i, idx) => {
                    const fullItemDetails = finditem(i.item_id);
                    return (
                      <OrderItemRow
                        key={i.order_item_id || idx}
                        index={idx}
                        name={fullItemDetails ? fullItemDetails.item_name : (i.name || "Loading item name...")}
                        quantity={i.quantity}
                        price={`Rs. ${i.price || (fullItemDetails ? fullItemDetails.price : 0)}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </ListPage>
  );
}

export default AllOrders;