const { createClient } = require('@supabase/supabase-js');

const url = 'https://nmrtzobqtbrbcqpbvipo.supabase.co';
const key = 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn';
const supabase = createClient(url, key);

async function run() {
  const { data: existing } = await supabase.from('products').select('id, name, slug').ilike('name', '%shorts%');
  console.log('Existing shorts:', existing);
  const hasMen = existing && existing.some(p => p.slug.includes('men'));
  if (!hasMen) {
    const newShorts = {
      id: 'd8c4e12a-3b5f-4a89-91c2-ef4821a7c001',
      name: "Men's Vintage Washed Denim Shorts",
      name_bn: 'মেনস ভিন্টেজ ওয়াশ ডেনিম শর্টস',
      slug: 'mens-vintage-washed-denim-shorts-8801',
      category: "Men's Straight Leg Jeans",
      gender: 'men',
      fit: 'Regular Fit',
      wash_color: 'Vintage Light Blue',
      fabric_composition: '100% Ring-Spun Denim Cotton',
      description: "Classic five-pocket men's denim shorts with premium vintage wash and rolled cuffs. Perfect for casual summer style and effortless streetwear.",
      details: [
        '100% Ring-Spun Cotton Denim',
        'Wash: Vintage Light Blue',
        'Fit: Regular Comfort Shorts',
        'Reinforced bar-tack stitching & copper hardware',
        '__TRYON__:{"enabled":true,"type":"both","category":"bottoms","garmentType":"shorts","assetUrl":"/images/products/men_denim_shorts.jpg"}'
      ],
      fabric_care: ['Machine wash cold inside out', 'Tumble dry low or hang dry'],
      price: 1150,
      discount_price: 990,
      discount_percentage: 14,
      thumbnail: '/images/products/men_denim_shorts.jpg',
      images: ['/images/products/men_denim_shorts.jpg', '/images/tryon-models/men_shorts.jpg'],
      rating: 5,
      review_count: 8,
      is_new_arrival: true,
      is_best_seller: true,
      is_featured: true,
      is_on_sale: true,
      is_active: true,
      total_stock: 40,
      tags: ['denim-shorts', 'men', 'summer-vibes'],
      variants: [
        { id: 'v-mshort-28', sku: 'JBD-MSHORT-28', size: '28', color: 'Light Blue', stock: 10, colorHex: '#93c5fd' },
        { id: 'v-mshort-30', sku: 'JBD-MSHORT-30', size: '30', color: 'Light Blue', stock: 10, colorHex: '#93c5fd' },
        { id: 'v-mshort-32', sku: 'JBD-MSHORT-32', size: '32', color: 'Light Blue', stock: 10, colorHex: '#93c5fd' },
        { id: 'v-mshort-34', sku: 'JBD-MSHORT-34', size: '34', color: 'Light Blue', stock: 10, colorHex: '#93c5fd' }
      ]
    };
    const { data, error } = await supabase.from('products').insert([newShorts]).select();
    if (error) console.error('Insert error:', error);
    else console.log('Successfully inserted Men Denim Shorts to Supabase:', data[0].name);
  } else {
    console.log('Men shorts already exist');
  }
}

run();
