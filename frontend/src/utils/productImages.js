/**
 * Helper to provide curated, high-quality editorial placeholder images
 * based on product name and category for the MODIMAL marketplace.
 */

const CURATED_IMAGES = {
  smartphone_samsung: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
  smartphone_oneplus: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
  laptop_macbook: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  mouse_gaming: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
  mouse_mx: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
  keyboard_mechanical: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
  headphones_sony: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  watch_chronograph: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  watch_titanium: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
  coat_merino: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  shirt_linen: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  boots_chelsea: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
  dress_slip: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
  sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
  candle: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80',
  coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
  wallet: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
  bag_leather: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
  ethnic_saree: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
  ethnic_kurti: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  dress_zara: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
  shirt_rare_rabbit: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
  sneakers_puma: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  sneakers_kids: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80',
  kids_kurta: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
  jewelry_jhumka: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  default_curated: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
}

export function getProductImage(product) {
  if (
    product?.image &&
    typeof product.image === 'string' &&
    (product.image.trim().startsWith('http') || product.image.trim().startsWith('data:image'))
  ) {
    return product.image
  }

  // Check custom vendor uploaded images saved in local storage
  try {
    const customRegistry = JSON.parse(
      localStorage.getItem('vendor_uploaded_product_images') || '{}'
    )
    if (product?.id && customRegistry[product.id]) {
      return customRegistry[product.id]
    }
    const cleanName = (product?.name || '').trim().toLowerCase()
    if (cleanName && customRegistry[cleanName]) {
      return customRegistry[cleanName]
    }
  } catch (e) {
    // localStorage unavailable
  }

  const name = (product?.name || '').toLowerCase()
  const cat = (product?.categoryName || product?.category || '').toLowerCase()

  // 1. Specific name matching
  if (name.includes('saree')) return CURATED_IMAGES.ethnic_saree
  if (name.includes('kurti') || name.includes('chanderi')) return CURATED_IMAGES.ethnic_kurti
  if (name.includes('rare rabbit')) return CURATED_IMAGES.shirt_rare_rabbit
  if (name.includes('puma') && name.includes('kids')) return CURATED_IMAGES.sneakers_kids
  if (name.includes('puma') || name.includes('sneaker')) return CURATED_IMAGES.sneakers_puma
  if (name.includes('kids') || name.includes('kid')) return CURATED_IMAGES.kids_kurta
  if (name.includes('jhumka') || name.includes('kundan') || name.includes('earring')) return CURATED_IMAGES.jewelry_jhumka
  if (name.includes('zara') || name.includes('floral')) return CURATED_IMAGES.dress_zara
  if (name.includes('s25') || name.includes('samsung')) return CURATED_IMAGES.smartphone_samsung
  if (name.includes('oneplus')) return CURATED_IMAGES.smartphone_oneplus
  if (name.includes('macbook') || name.includes('apple') || name.includes('laptop')) return CURATED_IMAGES.laptop_macbook
  if (name.includes('headphone') || name.includes('sony') || name.includes('wh-1000')) return CURATED_IMAGES.headphones_sony
  if (name.includes('master 3s') || name.includes('logitech')) return CURATED_IMAGES.mouse_mx
  if (name.includes('gaming mouse') || name.includes('rgb ergonomic')) return CURATED_IMAGES.mouse_gaming
  if (name.includes('keyboard')) return CURATED_IMAGES.keyboard_mechanical
  if (name.includes('titanium') && name.includes('watch')) return CURATED_IMAGES.watch_titanium
  if (name.includes('watch') || name.includes('chronograph')) return CURATED_IMAGES.watch_chronograph
  if (name.includes('overcoat') || name.includes('wool') || name.includes('coat')) return CURATED_IMAGES.coat_merino
  if (name.includes('shirt') || name.includes('linen')) return CURATED_IMAGES.shirt_linen
  if (name.includes('chelsea') || name.includes('boot')) return CURATED_IMAGES.boots_chelsea
  if (name.includes('dress') || name.includes('slip')) return CURATED_IMAGES.dress_slip
  if (name.includes('sunglasses') || name.includes('polarized') || name.includes('eyewear')) return CURATED_IMAGES.sunglasses
  if (name.includes('candle') || name.includes('amber')) return CURATED_IMAGES.candle
  if (name.includes('coffee') || name.includes('pour-over') || name.includes('dripper')) return CURATED_IMAGES.coffee
  if (name.includes('lamp') || name.includes('lighting')) return CURATED_IMAGES.lamp
  if (name.includes('wallet') || name.includes('bi-fold')) return CURATED_IMAGES.wallet
  if (name.includes('backpack') || name.includes('bag') || name.includes('tote')) return CURATED_IMAGES.bag_leather

  // 2. Category matching
  if (cat.includes('living') || cat.includes('home')) return CURATED_IMAGES.candle
  if (cat.includes('jewelry') || cat.includes('accessori')) return CURATED_IMAGES.sunglasses
  if (cat.includes('footwear') || cat.includes('shoe')) return CURATED_IMAGES.boots_chelsea
  if (cat.includes('fashion') || cat.includes('cloth')) return CURATED_IMAGES.coat_merino
  if (cat.includes('electronic') || cat.includes('gadget')) return CURATED_IMAGES.headphones_sony

  return CURATED_IMAGES.default_curated
}
