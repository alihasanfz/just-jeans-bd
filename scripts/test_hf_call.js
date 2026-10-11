const fs = require('fs');

async function testHf() {
  const humanPath = 'public/images/tryon-models/women_shorts.jpg';
  const garmentPath = 'public/images/products/women_butterfly_shorts.png';
  const maskPath = 'test_mask.png';

  const humanBuf = fs.readFileSync(humanPath);
  const garmentBuf = fs.readFileSync(garmentPath);
  const maskBuf = fs.readFileSync(maskPath);

  const spaceUrl = 'https://yisol-idm-vton.hf.space';
  
  // Upload human
  const form1 = new FormData();
  form1.append('files', new Blob([humanBuf], { type: 'image/jpeg' }), 'human.jpg');
  const upRes1 = await fetch(`${spaceUrl}/upload`, { method: 'POST', body: form1 });
  const upData1 = await upRes1.json();
  console.log('Upload human:', upData1);

  // Upload garment
  const form2 = new FormData();
  form2.append('files', new Blob([garmentBuf], { type: 'image/png' }), 'garment.png');
  const upRes2 = await fetch(`${spaceUrl}/upload`, { method: 'POST', body: form2 });
  const upData2 = await upRes2.json();
  console.log('Upload garment:', upData2);

  // Upload mask
  const form3 = new FormData();
  form3.append('files', new Blob([maskBuf], { type: 'image/png' }), 'mask.png');
  const upRes3 = await fetch(`${spaceUrl}/upload`, { method: 'POST', body: form3 });
  const upData3 = await upRes3.json();
  console.log('Upload mask:', upData3);

  const humanFilePath = upData1[0];
  const garmentFilePath = upData2[0];
  const maskFilePath = upData3[0];

  const payload = {
    data: [
      // 0: ImageEditor dict
      {
        background: {
          path: humanFilePath,
          url: `${spaceUrl}/file=${humanFilePath}`,
          size: humanBuf.length,
          orig_name: 'human.jpg',
          mime_type: 'image/jpeg',
          is_stream: false,
          meta: { _type: 'gradio.FileData' }
        },
        layers: [
          {
            path: maskFilePath,
            url: `${spaceUrl}/file=${maskFilePath}`,
            size: maskBuf.length,
            orig_name: 'mask.png',
            mime_type: 'image/png',
            is_stream: false,
            meta: { _type: 'gradio.FileData' }
          }
        ],
        composite: null
      },
      // 1: Garment Image
      {
        path: garmentFilePath,
        url: `${spaceUrl}/file=${garmentFilePath}`,
        size: garmentBuf.length,
        orig_name: 'garment.png',
        mime_type: 'image/png',
        is_stream: false,
        meta: { _type: 'gradio.FileData' }
      },
      // 2: garment_des
      'High-Rise Floral & Butterfly Denim Shorts, lower body denim shorts',
      // 3: is_checked (false because custom mask provided)
      false,
      // 4: is_checked_crop (false)
      false,
      // 5: denoise_steps
      20,
      // 6: seed
      42
    ]
  };

  console.log('Submitting tryon call with mask layer...');
  const res = await fetch(`${spaceUrl}/call/tryon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log('Call tryon status:', res.status);
  const callData = await res.json();
  console.log('Call tryon data:', callData);

  const eventId = callData.event_id;
  if (!eventId) return;

  console.log('Waiting for SSE stream /call/tryon/' + eventId);
  const sseRes = await fetch(`${spaceUrl}/call/tryon/${eventId}`);
  const reader = sseRes.body.getReader();
  const decoder = new TextDecoder();
  let total = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    total += chunk;
    console.log('CHUNK:', chunk);
    if (total.includes('event: complete') || total.includes('event: error')) {
      break;
    }
  }
}

testHf().catch(console.error);
