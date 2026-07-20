const fs = require('fs');
const path = require('path');

const srcBase = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\RECURSOS IMAGENES';
const destBase = path.join(__dirname, 'public', 'images', 'carousel');

const countries = ['ARGENTINA', 'BRASIL', 'CHILE', 'COLOMBIA', 'ECUADOR', 'PARAGUAY'];
const result = {};

countries.forEach(country => {
  const srcDir = path.join(srcBase, country);
  const destDir = path.join(destBase, country.toLowerCase());
  
  if (fs.existsSync(srcDir)) {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    
    const files = fs.readdirSync(srcDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
    const paths = [];
    
    files.forEach(file => {
      // Clean filename for web
      const cleanName = file.replace(/\s+/g, '-').toLowerCase();
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, cleanName));
      paths.push(`/images/carousel/${country.toLowerCase()}/${cleanName}`);
    });
    
    result[country.toLowerCase()] = paths;
  }
});

console.log(JSON.stringify(result, null, 2));
