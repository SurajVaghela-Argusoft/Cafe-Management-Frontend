import { useContext, useEffect, useState } from "react";
import axios from "../../../api";
import { itemsContext } from "../../../context/ItemsContext";
import IndexBadge from "../../../components/common/IndexBadge";
import ListPage from "../../../components/common/ListPage";
import OrderItemRow from "../../../components/common/OrderItemRow";

const Customer = () => {
    const [customer, setCustomer] = useState([]);
    const [search, setSearch] = useState(""); 
    const dbitems = useContext(itemsContext) || [];

    const [visibleOrders, setVisibleOrders] = useState({});
    const [visibleItems, setVisibleItems] = useState({});

    useEffect(() => {
        const getCustomers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://127.0.0.1:8000/admin/getallcustomer`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                setCustomer(response.data.data || []);
            } catch (err) {
                console.error("Error fetching customer data:", err);
            }
        };
        getCustomers();
    }, []);

    const finditem = (id) => {
        if (!dbitems || dbitems.length === 0) return null;
        return dbitems.find(prev => prev.item_id === id);
    };

    const toggleOrders = (customerId) => {
        setVisibleOrders(prev => ({
            ...prev,
            [customerId]: !prev[customerId]
        }));
    };

    const toggleItems = (orderId) => {
        setVisibleItems(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const filteredCustomers = customer.filter((c) =>
        (c.name || "").toLowerCase().includes(search.trim().toLowerCase())
    );

    if (customer.length === 0) { return <h2>No Customer Available</h2> }

    return (
        <ListPage>
           
            <div className="col-12 mb-3">
                <input
                    type="text"
                    className="form-control rounded-3 shadow-sm py-2 px-3"
                    placeholder="Search customer by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredCustomers.length === 0 && (
                <p className="col-12 text-muted text-center">
                    No customers found matching "{search}".
                </p>
            )}

            {filteredCustomers.map((emp, idx) => {
                const isOrderVisible = visibleOrders[emp.user_id];

                return (
                    <div key={emp.user_id} className="col-12 p-4 bg-white rounded-4 shadow-sm position-relative">
                        <IndexBadge>{idx + 1}</IndexBadge>

                        <h4 className="fw-bold text-dark mb-3 fs-5" style={{ letterSpacing: "-0.3px" }}>
                            Customer: {emp.name}
                        </h4>

                        <div className="d-flex flex-wrap gap-4 mb-4 text-muted small">
                            <span><strong className="text-dark fw-medium">Email:</strong> {emp.email}</span>
                            <span><strong className="text-dark fw-medium">Phone:</strong> {emp.phone}</span>
                        </div>

                        <button onClick={() => toggleOrders(emp.user_id)} className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-medium border-0 shadow-sm">
                            {isOrderVisible ? "Hide Orders" : "Show Orders"}
                        </button>

                        {isOrderVisible && (
                            <div className="mt-2 pt-2 border-top border-light-subtle d-flex flex-column gap-3">
                                <h4 className="fw-bold text-dark fs-6 mb-0 opacity-75">Orders History</h4>

                                {(emp.orders || []).length === 0 && (
                                    <p className="text-muted small bg-light p-3 rounded-3 border-0 text-center mb-0">
                                        No orders placed by this customer.
                                    </p>
                                )}

                                {(emp.orders || []).map((o, id) => {
                                    const isItemsVisible = visibleItems[o.order_id];
                                    return (
                                        <div key={o.order_id} className="p-4 bg-light border-0 rounded-3">
                                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                                <h5 className="fw-bold text-dark fs-6 mb-0">Order {id + 1}</h5>
                                                <span className="badge bg-dark text-white rounded-2 px-2 py-1 small fw-medium">
                                                    {o.order_status}
                                                </span>
                                            </div>

                                            <div className="row g-2 mb-3 text-muted small">
                                                <span className="col-sm-6"><strong className="text-dark fw-medium">Placed at:</strong> {o.created_at}</span>
                                                <span className="col-sm-6"><strong className="text-dark fw-medium">Total Amount:</strong>  Rs. {o.total_amount}</span>
                                                <span className="col-sm-12"><strong className="text-dark fw-medium">Payment:</strong> {o.payment}</span>
                                            </div>

                                            <button onClick={() => toggleItems(o.order_id)} className="btn btn-link p-0 text-dark text-decoration-none small link-secondary fw-semibold">
                                                {isItemsVisible ? "↓ Hide Items" : "Show Items"}
                                            </button>

                                            {isItemsVisible && (
                                                <div className="mt-3 pt-3 border-top border-secondary-subtle d-flex flex-column gap-2">
                                                    <h6 className="fw-semibold text-dark fs-6 small mb-1 opacity-50">Items Ordered</h6>
                                                    {(o.order_items || []).map((oi, oid) => {
                                                        const fullItemDetails = finditem(oi.item_id);
                                                        return (
                                                            <OrderItemRow
                                                                key={oi.order_item_id}
                                                                index={oid}
                                                                name={fullItemDetails ? fullItemDetails.item_name : "Loading item name..."}
                                                                quantity={oi.quantity}
                                                                price={`Rs. ${oi.price || (fullItemDetails ? fullItemDetails.price : 0)}`}
                                                                className="bg-white rounded-2 border border-light-subtle"
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </ListPage>
    );
}

export default Customer;