import { useState, useEffect, createContext } from "react";

export const CartContext = createContext();

const CartIdContext = (props) => {
    const [cartId, setCartId] = useState(() => {
        const savedId = localStorage.getItem('active_cart_id');
        return savedId ? JSON.parse(savedId) : null;
    }); 
    
    useEffect(() => {
        if (cartId !== null && cartId !== undefined) {
            localStorage.setItem('active_cart_id', JSON.stringify(cartId));
        }
    }, [cartId]);

    return (
        <CartContext.Provider value={[cartId, setCartId]}>
            {props.children}
        </CartContext.Provider>
    );
};

export default CartIdContext;
