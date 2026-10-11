const { createClient } = require('@supabase/supabase-js');

const url = 'https://nmrtzobqtbrbcqpbvipo.supabase.co';
const key = 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
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
            assetUrl: '/images/products/women_butterfly_shorts.png',
          },
        })
      ]
    })
    .ilike('name', '%butterfly%')
    .select();

  console.log('Updated products count:', data?.length);
  if (error) console.error('Error updating:', error);
  if (data && data.length > 0) {
    console.log('Updated item:', data[0].name, 'Category:', data[0].category, 'Thumbnail:', data[0].thumbnail);
  }
}

run();
