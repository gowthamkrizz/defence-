const fs = require('fs');
const https = require('https');
const path = require('path');

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Unsplash high-quality content-related photos
// Format parameters: fm=webp (WebP format), w=800 (resized), q=60 (compressed under 100kb), txt=0 (no watermark)
const images = {
  'drone_hero.webp': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=60&fm=webp',
  'command_center.webp': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60&fm=webp',
  'military_ind.webp': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=60&fm=webp',
  'border_ind.webp': 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=60&fm=webp',
  'energy_ind.webp': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=60&fm=webp',
  'maritime_ind.webp': 'https://images.unsplash.com/photo-1500049242364-5f500807cdd7?auto=format&fit=crop&w=600&q=50&fm=webp',
  'mining_ind.webp': 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=60&fm=webp',
  'emergency_ind.webp': 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=600&q=50&fm=webp'
};

console.log("Starting WebP asset downloads...");

Object.entries(images).forEach(([filename, url]) => {
  const filePath = path.join(assetsDir, filename);
  const file = fs.createWriteStream(filePath);
  
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(filePath);
      const fileSizeInKb = (stats.size / 1024).toFixed(1);
      console.log(`Downloaded ${filename} - Size: ${fileSizeInKb}KB - Format: WebP`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${filename}:`, err.message);
  });
});
