// ==============================================================================
// TEMPORARY UI PLACEHOLDER DATA (MODIMAL EDITORIAL THEME)
// ------------------------------------------------------------------------------
// Isolated static data simulating a general multi-vendor marketplace
// (Fashion, Electronics, Home & Living, Accessories).
// Strictly temporary until real backend endpoints (e.g. GET /api/products) are wired.
// ==============================================================================

export const EDITORIAL_CATEGORIES = [
  {
    id: 'cat-fashion',
    name: 'Modern Wardrobe',
    categoryKey: 'Fashion',
    subtitle: 'Tailored essentials & organic silhouettes',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80',
    link: '/products?category=Fashion',
  },
  {
    id: 'cat-electronics',
    name: 'Everyday Tech',
    categoryKey: 'Electronics',
    subtitle: 'Precision acoustics, displays & work tools',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
    link: '/products?category=Electronics',
  },
  {
    id: 'cat-home',
    name: 'Living & Interior',
    categoryKey: 'Home & Living',
    subtitle: 'Ceramics, ambient lighting & objects',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80',
    link: '/products?category=Home',
  },
  {
    id: 'cat-accessories',
    name: 'Objects & Accents',
    categoryKey: 'Accessories',
    subtitle: 'Timepieces, leather goods & everyday carry',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
    link: '/products?category=Accessories',
  },
]

export const NEW_ARRIVALS = [
  {
    id: 'na-1',
    name: 'Sony WH-1000XM5 Studio Headphones',
    category: 'Electronics',
    price: 29990,
    originalPrice: 34990,
    availability: 'In Stock',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'na-2',
    name: 'Italian Tailored Linen Casual Shirt',
    category: 'Fashion',
    price: 3499,
    originalPrice: 4299,
    availability: 'In Stock',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'na-3',
    name: 'Ceramic Matte Pour-Over Coffee Set',
    category: 'Home & Living',
    price: 1899,
    originalPrice: 2499,
    availability: 'Low Stock',
    badge: 'Artisan',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'na-4',
    name: 'Solid Titanium Mechanical Chronograph',
    category: 'Accessories',
    price: 16999,
    originalPrice: 19999,
    availability: 'In Stock',
    badge: 'Luxury',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
  },
]

export const FEATURED_PRODUCTS = [
  {
    id: 'fp-1',
    name: 'Wireless Ergonomic Mechanical Keyboard',
    category: 'Electronics',
    price: 5999,
    originalPrice: 7499,
    availability: 'In Stock',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'fp-2',
    name: 'Handcrafted Leather Chelsea Boots',
    category: 'Fashion',
    price: 5999,
    originalPrice: 7499,
    availability: 'In Stock',
    badge: 'Staff Pick',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'fp-3',
    name: 'Artisan Leather Everyday Backpack',
    category: 'Fashion',
    price: 5499,
    originalPrice: 6999,
    availability: 'In Stock',
    badge: 'Curator Pick',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'fp-4',
    name: 'Top-Grain Italian Leather Bi-Fold Wallet',
    category: 'Accessories',
    price: 1699,
    originalPrice: 2299,
    availability: 'In Stock',
    badge: 'Essential',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
  },
]

export const MARKETPLACE_BENEFITS = [
  {
    id: 'ben-1',
    iconName: 'ShieldCheck',
    title: 'Trusted Sellers',
    description: 'Every vendor is verified through stringent quality audits.',
  },
  {
    id: 'ben-2',
    iconName: 'Lock',
    title: 'Secure Shopping',
    description: 'Protected payments backed by industry-standard encryption.',
  },
  {
    id: 'ben-3',
    iconName: 'Sparkles',
    title: 'Quality Products',
    description: 'Carefully curated goods built from honest, durable materials.',
  },
  {
    id: 'ben-4',
    iconName: 'RefreshCw',
    title: 'Easy Returns',
    description: 'Complimentary 30-day returns with frictionless dispatch.',
  },
]
