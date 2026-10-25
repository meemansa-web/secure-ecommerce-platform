import React, { createContext, useContext, useState, useEffect } from 'react'
import { useCart } from './CartContext'

const WishlistContext = createContext()

const WISHLIST_STORAGE_KEY = 'modimal_customer_wishlist_v1'

export function WishlistProvider({ children }) {
  const { addToCart } = useCart()

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load wishlist from storage', e)
      return []
    }
  })

  const [wishlistToast, setWishlistToast] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems))
    } catch (e) {
      console.error('Failed to save wishlist to storage', e)
    }
  }, [wishlistItems])

  const showToast = (message, actionLink = null) => {
    setWishlistToast({ message, actionLink, id: Date.now() })
    setTimeout(() => {
      setWishlistToast(null)
    }, 3200)
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId)
  }

  const addToWishlist = (product) => {
    if (!product || !product.id) return

    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev
      const newItem = {
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        categoryName: product.categoryName || product.category || 'Curated',
        vendorName: product.vendorName || 'Nivora Merchant',
        description: product.description || '',
      }
      showToast(`Added "${product.name}" to your wishlist`, '/customer/wishlist')
      return [newItem, ...prev]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => {
      const removed = prev.find((item) => item.id === productId)
      if (removed) {
        showToast(`Removed "${removed.name}" from your wishlist`)
      }
      return prev.filter((item) => item.id !== productId)
    })
  }

  const toggleWishlist = (product) => {
    if (!product || !product.id) return false
    const exists = isInWishlist(product.id)
    if (exists) {
      removeFromWishlist(product.id)
      return false
    } else {
      addToWishlist(product)
      return true
    }
  }

  const moveToCart = (product) => {
    if (!product || !product.id) return
    addToCart(product, 1)
    setWishlistItems((prev) => prev.filter((item) => item.id !== product.id))
    showToast(`Moved "${product.name}" to your shopping bag`, '/customer/cart')
  }

  const moveAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart(item, 1)
    })
    setWishlistItems([])
    showToast('Moved all wishlist items to your shopping bag', '/customer/cart')
  }

  const clearWishlist = () => {
    setWishlistItems([])
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        moveAllToCart,
        clearWishlist,
        wishlistToast,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
