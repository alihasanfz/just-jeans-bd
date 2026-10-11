const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://nmrtzobqtbrbcqpbvipo.supabase.co', 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn');

async function fix() {
  const { data, error } = await s
    .from('products')
    .update({
      category: "Women's Denim Shorts",
      thumbnail: '/images/products/women_butterfly_shorts.png',
      images: ['/images/products/women_butterfly_shorts.png', '/images/tryon-models/women_shorts.jpg'],
      details: [
        '100% Premium Cotton Denim with Butterfly Embroidery',
        'High-Rise Comfortable Summer Silhouette',
        'Distressed Frayed Hemline Detailing',
        'Signature 5-Pocket Construction',
        JSON.stringify({
          __TRYON__: {
            enabled: true,
            type: 'both',
            category: 'bottoms',
            garmentType: 'shorts',
            assetUrl: '/images/products/women_butterfly_shorts.png'
          }
        })
      ]
    })
    .eq('id', '1c28fe7b-af9a-4b86-8fdd-c2b9042d478d')
    .select();

  console.log('Updated 7962 result:', data?.length, error);
}

fix();
