import { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
import axios from "../../../api";
import { CartContext } from '../../../context/CartIdContext';
import { itemsContext } from '../../../context/ItemsContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState';
import NarrowPage from '../../../components/common/NarrowPage';

const Order = () => {
  const navigate = useNavigate();
  const [cart, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartId] = useContext(CartContext) || [];
  const dbitems = useContext(itemsContext) || [];

  useEffect(() => {
    if (!cartId) return;

    const getcart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/customer/getcartbyid/${cartId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        setCartData(response.data.data || response.data);
      } catch (err) {
        console.error("Error fetching cart data:", err);
      } finally {
        setLoading(false);
      }
    };

    getcart();
  }, [cartId]);

  const finditem = (id) => dbitems?.find(prev => prev.item_id === id) || null;

  const calculateTotal = () => {
    if (!cart || !Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + ((finditem(item.item_id)?.price || 0) * item.quantity), 0);
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/customer/placeorder/${cartId}`, {}, {
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });

      localStorage.removeItem('active_cart_id');
      alert("Order placed successfully!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Something went wrong processing your order.");
    }
  };

  if (!cartId || loading || !cart || cart.length === 0) {
    return (
      <EmptyState
        fullHeight
        text={!cartId ? "Syncing session..." : loading ? "Loading items..." : "No items found."}
      />
    );
  }

  return (
    <NarrowPage title="Order Summary" subtitle="Review your items and confirm your order placement">
      <div className="d-flex flex-column gap-2 mb-4">
        {cart.map((item, idx) => {
          const details = finditem(item.item_id);
          return (
            <div key={item.item_id || idx} className="p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center small">
              <div className="text-dark">
                <strong className="d-block mb-1">{details ? details.item_name : "Loading..."}</strong>
                <span className="text-muted opacity-75">
                  Qty: {item.quantity} {details?.item_size && `(${details.item_size})`}
                </span>
              </div>
              <div className="text-dark fw-bold">
                ₹{(details?.price || 0) * item.quantity}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-light p-3 rounded-3 mb-3 border-0 d-flex justify-content-between align-items-center text-dark">
        <span className="fs-5 fw-bold">Total Bill:</span>
        <span className="fs-4 fw-bold">₹{calculateTotal()}</span>
      </div>

      <button onClick={placeOrder} className="btn btn-dark w-100 fw-semibold border-0 shadow-sm" style={{ letterSpacing: "0.3px" }}>
        Place Order
      </button>
    </NarrowPage>
  );
};

export default Order;
