const fs = require('fs');
const path = require('path');

const srcBase = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\RECURSOS IMAGENES';
const destBase = path.join(__dirname, 'public', 'images', 'carousel');

const countries = ['BRASIL', 'COLOMBIA', 'CHILE', 'PARAGUAY'];

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

countries.forEach(country => {
  const srcDir = path.join(srcBase, country);
  if (!fs.existsSync(srcDir)) return;

  const destDir = path.join(destBase, country.toLowerCase());
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    if (file.toLowerCase().includes('carrusel') || file.toLowerCase().includes('carousel')) {
      const srcFile = path.join(srcDir, file);
      // Clean up the file name a bit
      const safeName = file.replace(/\s+/g, '-').toLowerCase();
      const destFile = path.join(destDir, safeName);
      
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied ${file} to ${destFile}`);
    }
  });
});
