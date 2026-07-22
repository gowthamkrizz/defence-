const fs = require('fs');
const https = require('https');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const images = {
  'vtol_drone.webp': 'https://images.unsplash.com/photo-1559087867-ce4c91325525?auto=format&fit=crop&w=800&q=50&fm=webp',
  'micro_drone.webp': 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=50&fm=webp',
  'sentry_ugv.webp': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=50&fm=webp',
  'logistics_ugv.webp': 'https://images.unsplash.com/photo-1614088899859-9942a0b166fc?auto=format&fit=crop&w=600&q=50&fm=webp',
  'tactical_ugv.webp': 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=50&fm=webp'
};

console.log("Starting WebP solutions asset downloads...");

Object.entries(images).forEach(([filename, url]) => {
  const filePath = path.join(assetsDir, filename);
  const file = fs.createWriteStream(filePath);
  
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(filePath);
      const fileSizeInKb = (stats.size / 1024).toFixed(1);
      console.log(`Downloaded ${filename} - Size: ${fileSizeInKb}KB`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${filename}:`, err.message);
  });
});
