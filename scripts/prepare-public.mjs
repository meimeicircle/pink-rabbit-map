import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

async function prepare() {
  try {
    // 1. Copy map*.png from root to public/ if they exist in root
    const files = fs.readdirSync('.');
    for (const file of files) {
      if (file.startsWith('map') && file.endsWith('.png')) {
        const dest = path.join('public', file);
        fs.copyFileSync(file, dest);
        console.log(`Copied ${file} to public/`);
      }
    }

    // 2. Generate icons if available
    if (fs.existsSync('public/map3.png')) {
      const desktopImg = await Jimp.read('public/map3.png');
      await desktopImg.resize({ w: 192, h: 192 }).write('public/icon-192.png');
      await desktopImg.resize({ w: 512, h: 512 }).write('public/icon-512.png');
      console.log('Generated icon-192.png and icon-512.png');
    } else {
      console.log('public/map3.png not found, skipping icon generation');
    }
  } catch (err) {
    console.error('Error preparing public folder:', err);
  }
}

prepare();
