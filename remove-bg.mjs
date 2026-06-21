import { Jimp } from 'jimp';

async function removeBackground(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // We will flood-fill from (0,0) assuming it is background
    const startColor = image.getPixelColor(0, 0); // usually black 0x000000FF
    const targetAlpha = 0x00000000;
    
    // Check if background is actually black, or if we define "black" loosely
    // We'll treat anything very close to black as background
    const isBg = (color) => {
      const r = (color >> 24) & 0xFF;
      const g = (color >> 16) & 0xFF;
      const b = (color >> 8) & 0xFF;
      // threshold for black background
      return r < 15 && g < 15 && b < 15;
    };

    if (!isBg(startColor)) {
      console.log(`Image ${inputPath} top-left is not black background. Skipping.`);
      return;
    }

    const queue = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]];
    const visited = new Set();
    
    const idx = (x, y) => `${x},${y}`;

    while(queue.length > 0) {
      const [x, y] = queue.shift();
      const pos = idx(x,y);
      if (visited.has(pos)) continue;
      visited.add(pos);

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const c = image.getPixelColor(x, y);
      if (isBg(c)) {
        image.setPixelColor(targetAlpha, x, y);
        queue.push([x+1, y]);
        queue.push([x-1, y]);
        queue.push([x, y+1]);
        queue.push([x, y-1]);
      }
    }

    await image.write(outputPath);
    console.log(`Processed ${outputPath}`);
  } catch(e) {
    console.error('Error:', e);
  }
}

async function run() {
  await removeBackground('public/fenfen.png', 'public/fenfen.png');
  await removeBackground('public/bingbing.png', 'public/bingbing.png');
}

run();
