const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://nmrtzobqtbrbcqpbvipo.supabase.co', 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn');

async function updateCategories() {
  // 1. Jackets & Overshirt
  await s.from('products').update({ category: "Men's Denim Jacket" }).ilike('name', '%trucker%');
  await s.from('products').update({ category: "Men's Denim Jacket" }).ilike('name', '%bomber%');
  await s.from('products').update({ category: "Men's Denim Overshirt" }).ilike('name', '%overshirt%');

  // 2. Women's Jeans
  await s.from('products').update({ category: "Women's Jeans Pant" }).eq('id', '10d7530a-c468-43c7-8f24-97ca9f5a2a71');
  await s.from('products').update({ category: "Women's Flare Jeans" }).eq('id', 'c2962ec2-5083-4d39-b89f-9b555e856556');
  await s.from('products').update({ category: "Women's Flare Jeans" }).eq('id', '8b948e44-93b3-4daa-b1f7-d094d03bb74d');

  console.log('Categories updated!');
}

updateCategories().catch(console.error);
