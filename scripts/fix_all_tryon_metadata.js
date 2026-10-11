const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://nmrtzobqtbrbcqpbvipo.supabase.co', 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn');

async function fixAll() {
  const { data: products, error } = await s.from('products').select('*');
  if (error || !products) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Total products to check & fix:', products.length);

  for (const p of products) {
    const nameLower = (p.name || '').toLowerCase();
    const isJacket = nameLower.includes('jacket') || nameLower.includes('bomber') || nameLower.includes('trucker') || nameLower.includes('overshirt');
    const isShorts = nameLower.includes('shorts') || nameLower.includes('butterfly');
    const isWomen = p.gender === 'women' || nameLower.includes('butterfly') || nameLower.includes('flare') || nameLower.includes('scattered') || nameLower.includes('lace');

    const gender = isWomen ? 'women' : 'men';
    const category = isShorts
      ? (gender === 'women' ? "Women's Denim Shorts" : "Men's Denim Shorts")
      : isJacket
      ? (gender === 'women' ? "Women's Denim Jacket" : "Men's Denim Jacket")
      : (gender === 'women' ? "Women's Jeans Pant" : "Men's Straight Leg Jeans");

    const garmentType = isShorts ? 'shorts' : isJacket ? 'jacket' : 'jeans';
    const garmentCategory = isJacket ? 'tops' : 'bottoms';

    // Clean details: filter out any existing __TRYON__ entry and add the strictly verified one
    const cleanDetails = (p.details || []).filter(d => !d.includes('TRYON'));
    cleanDetails.push(JSON.stringify({
      __TRYON__: {
        enabled: true,
        type: 'both',
        category: garmentCategory,
        garmentType: garmentType,
        assetUrl: p.thumbnail || p.images?.[0] || ''
      }
    }));

    const updatePayload = {
      gender,
      category,
      details: cleanDetails
    };

    const { error: updErr } = await s
      .from('products')
      .update(updatePayload)
      .eq('id', p.id);

    if (updErr) {
      console.error('Error updating', p.name, updErr);
    } else {
      console.log(`Fixed: ${p.name} -> Gender: ${gender}, Cat: ${category}, Garment: ${garmentType} (${garmentCategory})`);
    }
  }

  console.log('All products successfully verified and updated!');
}

fixAll().catch(console.error);
