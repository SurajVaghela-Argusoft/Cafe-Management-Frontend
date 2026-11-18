import { useState, useEffect, useContext } from 'react';
import { itemsContext } from '../../../context/ItemsContext';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import axios from "../../../api";
import { CartContext } from '../../../context/CartIdContext';
import EmptyState from '../../../components/common/EmptyState';
import NarrowPage from '../../../components/common/NarrowPage';
import CartItemRow from '../components/CartItemRow';

const Carts = () => {
    const [cartId, setCartId] = useContext(CartContext) || [];
    const dbitems = useContext(itemsContext) || [];
    const navigate = useNavigate();

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart_items');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const finditem = (id) => dbitems?.find(prev => prev.item_id === id) || null;

    useEffect(() => {
        localStorage.setItem('cart_items', JSON.stringify(cart));
    }, [cart]);

    const removeItem = (id) => {
        setCart(prevCart => prevCart.filter(item => item.item_id !== id));
    };

    const increaseQ = (id) => {
        let temp = [...cart];
        let index = temp.findIndex(ele => ele.item_id === id);
        if (index !== -1) {
            ++temp[index].quantity;
        }
        setCart(temp);
    };

    const decreaseQ = (id) => {
        let temp = [...cart];
        let index = temp.findIndex(ele => ele.item_id === id);
        if (index !== -1 && temp[index].quantity > 1) {
            --temp[index].quantity;
        }
        setCart(temp);
    };

    const calculateTotal = () => {
        return cart.reduce((total, cartItem) => {
            return total + ((finditem(cartItem.item_id)?.price || 0) * cartItem.quantity);
        }, 0);
    };

    const goToOrder = async () => {
        if (cart.length === 0) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post("http://127.0.0.1:8000/customer/createcart", { "items": cart }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            const newCartId = response.data.data["cart_id"];
            setCartId(newCartId);
            localStorage.removeItem('cart_items');
            // alert(`Cart added successfully! Cart ID: ${newCartId}`);
            navigate("/order");
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        }
    };

    if (cart.length === 0) {
        return <EmptyState fullHeight text="Your basket is empty." />;
    }

    return (
        <NarrowPage title="Your Cart" subtitle="Manage selected products and modify quantities">
            {/* Items Container List */}
            <div className="d-flex flex-column gap-3 mb-4">
                {cart.map((item) => (
                    <CartItemRow
                        key={item.item_id}
                        item={item}
                        details={finditem(item.item_id)}
                        onIncrease={increaseQ}
                        onDecrease={decreaseQ}
                        onRemove={removeItem}
                    />
                ))}
            </div>

            {/* Total and Order Actions */}
            <div className="bg-light p-3 rounded-3 mb-3 border-0 d-flex justify-content-between align-items-center text-dark">
                <span className="fs-5 fw-bold">Total Basket:</span>
                <span className="fs-4 fw-bold">₹{calculateTotal()}</span>
            </div>

            <button onClick={goToOrder} className="btn btn-dark w-100 fw-semibold border-0 shadow-sm" style={{ letterSpacing: "0.3px" }}>
                Go To Order Confirmation
            </button>
        </NarrowPage>
    );
};

export default Carts;
