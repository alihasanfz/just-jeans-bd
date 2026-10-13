const { createClient } = require('@supabase/supabase-js');

const url = 'https://nmrtzobqtbrbcqpbvipo.supabase.co';
const key = 'sb_publishable_meaAVvXdPVRF5pGJwi86Zg_IvITFpRn';
const supabase = createClient(url, key);

const updates = [
  {
    id: '25842174-7e4a-49f1-b161-2aa826432ee2',
    name: "Women's Denim Studded Crop Jacket",
    gender: 'women',
    category: "Women's Denim Jackets",
    thumbnail: '/images/products/women_studded_crop_jacket.jpg',
    images: ['/images/products/women_studded_crop_jacket.jpg'],
    garmentType: 'jacket',
    categoryType: 'tops',
  },
  {
    id: '6db12353-5f55-43c5-84d1-14e8ed99e469',
    name: "Women's Corduroy Crop Jacket",
    gender: 'women',
    category: "Women's Denim Jackets",
    thumbnail: '/images/products/women_corduroy_crop_jacket.jpg',
    images: ['/images/products/women_corduroy_crop_jacket.jpg'],
    garmentType: 'jacket',
    categoryType: 'tops',
  },
  {
    id: '1dbcedd8-900d-4dcf-87bc-905dd3b47df7',
    name: "Women's Laser Print Denim Jacket",
    gender: 'women',
    category: "Women's Denim Jackets",
    thumbnail: '/images/products/womens_laser_print_jacket.jpg',
    images: ['/images/products/womens_laser_print_jacket.jpg'],
    garmentType: 'jacket',
    categoryType: 'tops',
  },
  {
    id: '97e359ca-9fcb-4e04-a8a6-aa55ea18e186',
    name: "Men's distressed Laser with Studs",
    gender: 'men',
    category: "Men's Straight Leg Jeans",
    thumbnail: '/images/products/mens_distressed_laser_studs_3000.jpg',
    images: ['/images/products/mens_distressed_laser_studs_3000.jpg'],
    garmentType: 'jeans',
    categoryType: 'bottoms',
  },
  {
    id: '0fdff0d0-60b3-44c0-8b34-f21463e80abd',
    name: "Men's Laser Baggy Jeans",
    gender: 'men',
    category: "Men's Baggy & Wide Fit",
    thumbnail: '/images/products/mens_laser_baggy_jeans.png',
    images: ['/images/products/mens_laser_baggy_jeans.png'],
    garmentType: 'jeans',
    categoryType: 'bottoms',
  },
  {
    id: '10315bf8-dc5d-4f65-b465-a2d759988ee9',
    name: "Men's distressed Laser with Studs",
    gender: 'men',
    category: "Men's Straight Leg Jeans",
    thumbnail: '/images/products/mens_distressed_laser_studs_2200.jpg',
    images: ['/images/products/mens_distressed_laser_studs_2200.jpg'],
    garmentType: 'jeans',
    categoryType: 'bottoms',
  },
  {
    id: '423bd3c9-d083-433a-866d-19d787ddada1',
    name: "Men's distressed Laser with Studs Denim",
    gender: 'men',
    category: "Men's Slim Fit Jeans",
    thumbnail: '/images/products/mens_distressed_laser_studs_2500.jpg',
    images: ['/images/products/mens_distressed_laser_studs_2500.jpg'],
    garmentType: 'jeans',
    categoryType: 'bottoms',
  },
  {
    id: '91968437-643f-47a2-a28c-e646840c62f5',
    name: "Women's Denim laser Short",
    gender: 'women',
    category: "Women's Denim Shorts",
    thumbnail: '/images/products/womens_laser_denim_shorts.jpg',
    images: ['/images/products/womens_laser_denim_shorts.jpg', '/images/products/women_butterfly_shorts.png'],
    garmentType: 'shorts',
    categoryType: 'bottoms',
  },
  {
    id: 'e5608fcb-7fe4-4f65-88b4-001881e4d1c7',
    name: "Women's Denim Laser Crop Top",
    gender: 'women',
    category: "Women's Denim Jackets",
    thumbnail: '/images/products/womens_denim_laser_crop_top.jpg',
    images: ['/images/products/womens_denim_laser_crop_top.jpg'],
    garmentType: 'jacket',
    categoryType: 'tops',
  },
];

async function updateAll() {
  console.log('Updating all product photos and metadata...');
  for (const item of updates) {
    const tryOnPayload = JSON.stringify({
      __TRYON__: {
        enabled: true,
        type: 'both',
        category: item.categoryType,
        garmentType: item.garmentType,
        assetUrl: item.thumbnail,
      },
    });

    const details = [
      '100% Premium Ring-Spun Cotton Denim',
      'Wash: Vintage Indigo Artisanal Wash',
      `Category: ${item.category}`,
      'Signature bar-tack reinforcement & custom copper hardware',
      tryOnPayload,
    ];

    const { data, error } = await supabase
      .from('products')
      .update({
        name: item.name,
        gender: item.gender,
        category: item.category,
        thumbnail: item.thumbnail,
        images: item.images,
        details: details,
      })
      .eq('id', item.id)
      .select();

    if (error) {
      console.error(`Error updating ${item.name}:`, error);
    } else {
      console.log(`✓ Updated "${item.name}" -> ${item.thumbnail}`);
    }
  }
  console.log('All products successfully updated!');
}

updateAll();
