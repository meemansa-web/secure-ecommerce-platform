import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const CART_STORAGE_KEY = 'modimal_customer_cart_v1'

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load cart from storage', e)
      return []
    }
  })

  const [toastNotification, setToastNotification] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to storage', e)
    }
  }, [cartItems])

  const showToast = (message, type = 'success') => {
    setToastNotification({ message, type, id: Date.now() })
    setTimeout(() => {
      setToastNotification(null)
    }, 2800)
  }

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id)
      const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1)

      if (existingIndex > -1) {
        const updated = [...prevItems]
        const currentQty = updated[existingIndex].quantity
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + qtyToAdd,
        }
        showToast(`Updated quantity of "${product.name}" in your bag`)
        return updated
      } else {
        const newItem = {
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          categoryName: product.categoryName || product.category || 'Curated',
          vendorName: product.vendorName || 'Nivora Merchant',
          quantity: qtyToAdd,
        }
        showToast(`Added "${product.name}" to your shopping bag`)
        return [...prevItems, newItem]
      }
    })
  }

  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: qty } : item
      )
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((i) => i.id === productId)
      if (removedItem) {
        showToast(`Removed "${removedItem.name}" from your bag`, 'info')
      }
      return prevItems.filter((item) => item.id !== productId)
    })
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  )

  // Complimentary shipping over ₹1500, otherwise ₹99
  const shippingFee = cartSubtotal === 0 ? 0 : cartSubtotal >= 1500 ? 0 : 99

  // Estimated GST / tax is already included or standard
  const estimatedTax = 0

  const cartTotal = cartSubtotal + shippingFee

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        shippingFee,
        estimatedTax,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toastNotification,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
