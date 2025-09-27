import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
	const [cart, setCart] = useState([]);

	const addToCart = (item) => {
		setCart([...cart, { ...item, quantity: 1 }]);
	};

	const updateQuantity = (index, qty) => {
		const newCart = [...cart];
		newCart[index].quantity = qty > 0 ? qty : 1;
		setCart(newCart);
	};

	const clearCart = () => setCart([]);

	return <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
