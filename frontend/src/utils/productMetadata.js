/**
 * Nivora Marketplace - Product Classification & Navigation Metadata
 * Supports 3 distinct dimensions (English Only):
 * 1. Gender-based: Men, Women, Kids, Unisex
 * 2. Category-based: Ethnic Wear, Western Dresses, Menswear, Footwear, Home Decor, Jewellery & Accessories, Tech & Gadgets, Kids Fashion
 * 3. Brand-based: Rare Rabbit, Puma, FabIndia, Zara, Samsung, Apple, Sony, Nivora Luxe
 */

export const GENDER_OPTIONS = [
  { id: 'all', label: 'All Genders' },
  {
    id: 'women',
    label: 'Women',
    tagline: 'Ethnic Sarees, Kurtis & Western Dresses',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'men',
    label: 'Men',
    tagline: 'Tailored Shirts, Jackets & Casuals',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'kids',
    label: 'Kids',
    tagline: 'Festive Wear, Sets & Footwear',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'unisex',
    label: 'Unisex & Living',
    tagline: 'Watches, Home Living & Technology',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  },
]

export const CATEGORY_OPTIONS = [
  {
    id: 'ethnic-wear',
    slug: 'ethnic-wear',
    label: 'Ethnic Wear',
    subtitle: 'Sarees, Kurtis & Lehengas',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'western-dresses',
    slug: 'western-dresses',
    label: 'Western Dresses',
    subtitle: 'Midi, Slip & Cocktail',
    gender: 'women',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'menswear',
    slug: 'menswear',
    label: 'Menswear',
    subtitle: 'Oxford Shirts & Coats',
    gender: 'men',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'footwear',
    slug: 'footwear',
    label: 'Footwear',
    subtitle: 'Sneakers, Running Shoes & Boots',
    gender: 'unisex',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'home-decor',
    slug: 'home-decor',
    label: 'Home Decor',
    subtitle: 'Artisan Lamps, Candles & Decor',
    gender: 'unisex',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'jewellery',
    slug: 'jewellery',
    label: 'Jewellery & Accessories',
    subtitle: 'Kundan Jhumkas & Timepieces',
    gender: 'unisex',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'electronics',
    slug: 'electronics',
    label: 'Tech & Gadgets',
    subtitle: 'Smartphones, Audio & Laptops',
    gender: 'unisex',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'kids-wear',
    slug: 'kids-wear',
    label: 'Kids Fashion',
    subtitle: 'Festive Sets, Kurtas & Shoes',
    gender: 'kids',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=80',
  },
]

export const BRAND_OPTIONS = [
  {
    id: 'rare-rabbit',
    label: 'Rare Rabbit',
    origin: 'House of Rare',
    tagline: 'Modern Tailored Menswear',
    badge: 'LUXURY CASUAL',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'puma',
    label: 'Puma',
    origin: 'Puma Sportstyle',
    tagline: 'Running & Street Sneakers',
    badge: 'SPORTSWEAR',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'fabindia',
    label: 'FabIndia',
    origin: 'Artisan Heritage',
    tagline: 'Pure Chanderi & Handlooms',
    badge: 'HERITAGE ETHNIC',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'zara',
    label: 'Zara',
    origin: 'Inditex Studio',
    tagline: 'Floral Midi & Contemporary',
    badge: 'HIGH STREET',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'samsung',
    label: 'Samsung',
    origin: 'Galaxy AI Studio',
    tagline: 'Galaxy S25 & Flagship Tech',
    badge: 'FLAGSHIP TECH',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'apple',
    label: 'Apple',
    origin: 'Cupertino Studio',
    tagline: 'MacBook Air M3 Silicon',
    badge: 'PREMIUM COMPUTING',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'sony',
    label: 'Sony',
    origin: 'Sony Audio Lab',
    tagline: 'WH-1000XM5 Noise Cancelling',
    badge: 'PRO AUDIOPHILE',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'nivora',
    label: 'Nivora Luxe',
    origin: 'Nivora Studio LLC',
    tagline: 'Signature Handcrafted Living',
    badge: 'ORIGINAL SIGNATURE',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
  },
]

/**
 * Infer metadata (Gender, Brand, Subcategory) for a product based on its name and properties
 */
export function getProductMetadata(product) {
  if (!product) {
    return {
      gender: 'unisex',
      brand: 'Nivora Luxe',
      brandId: 'nivora',
      subCategory: 'Curated',
      isNewArrival: false,
    }
  }

  const name = (product.name || '').toLowerCase()
  const desc = (product.description || '').toLowerCase()
  const text = `${name} ${desc}`
  const cat = (product.categoryName || '').toLowerCase()

  // 1. Gender Determination (Strict Word Boundaries & Exact Mapping)
  let gender = 'unisex'
  if (
    /\b(kids?|child|children|boys?|smash v2)\b/i.test(name) ||
    name.includes('kids')
  ) {
    gender = 'kids'
  } else if (
    name.includes('saree') ||
    name.includes('kurti') ||
    name.includes('dress') ||
    name.includes('jhumka') ||
    name.includes('women') ||
    /\b(womens?|womenswear|sarees?|kurtis?|dresses?|slip dress|midi dress|lehenga|jhumkas?)\b/i.test(name)
  ) {
    gender = 'women'
  } else if (
    name.includes("men's") ||
    name.includes('shirt') ||
    name.includes('overcoat') ||
    /\b(mens?|menswear|oxford|overcoat|shirt)\b/i.test(name)
  ) {
    gender = 'men'
  }

  // 2. Brand Determination
  let brand = 'Nivora Luxe'
  let brandId = 'nivora'

  if (text.includes('rare rabbit')) {
    brand = 'Rare Rabbit'
    brandId = 'rare-rabbit'
  } else if (text.includes('puma')) {
    brand = 'Puma'
    brandId = 'puma'
  } else if (text.includes('fabindia') || text.includes('chanderi')) {
    brand = 'FabIndia'
    brandId = 'fabindia'
  } else if (text.includes('zara')) {
    brand = 'Zara'
    brandId = 'zara'
  } else if (text.includes('samsung')) {
    brand = 'Samsung'
    brandId = 'samsung'
  } else if (text.includes('apple') || text.includes('macbook')) {
    brand = 'Apple'
    brandId = 'apple'
  } else if (text.includes('sony') || text.includes('wh-1000')) {
    brand = 'Sony'
    brandId = 'sony'
  } else if (text.includes('oneplus')) {
    brand = 'OnePlus'
    brandId = 'oneplus'
  } else if (text.includes('logitech')) {
    brand = 'Logitech'
    brandId = 'logitech'
  } else if (product.vendorName && product.vendorName.includes('Chandni')) {
    brand = 'Chandni Heritage'
    brandId = 'chandni'
  }

  // 3. Sub-category
  let subCategory = product.categoryName || 'Curated'
  if (name.includes('saree') || name.includes('kurti')) {
    subCategory = 'Ethnic Wear'
  } else if (name.includes('dress')) {
    subCategory = 'Western Dresses'
  } else if (name.includes('shirt') || name.includes('overcoat')) {
    subCategory = 'Menswear'
  } else if (name.includes('sneaker') || name.includes('boot') || cat.includes('footwear')) {
    subCategory = 'Footwear'
  } else if (cat.includes('home') || name.includes('candle') || name.includes('lamp') || name.includes('coffee')) {
    subCategory = 'Home Decor'
  } else if (cat.includes('accessories') || name.includes('watch') || name.includes('sunglasses') || name.includes('jhumka') || name.includes('wallet')) {
    subCategory = 'Jewellery & Accessories'
  } else if (cat.includes('electronics') || name.includes('samsung') || name.includes('headphone') || name.includes('mouse') || name.includes('keyboard') || name.includes('macbook') || name.includes('phone')) {
    subCategory = 'Tech & Gadgets'
  } else if (name.includes('kids')) {
    subCategory = 'Kids Fashion'
  }

  // 4. New arrival (id >= 10 or recent)
  const isNewArrival = Boolean(product.id && product.id >= 10)

  return {
    gender,
    brand,
    brandId,
    subCategory,
    isNewArrival,
  }
}
