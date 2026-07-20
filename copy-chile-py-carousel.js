const fs = require('fs');
const path = require('path');

const srcBase = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\RECURSOS IMAGENES';
const destBase = path.join(__dirname, 'public', 'images', 'carousel');

const filesToCopy = [
  { src: 'CHILE/CHILE PATAGONIA.jpg', dest: 'chile/chile-patagonia.jpg' },
  { src: 'CHILE/CHILE PUERTO VARAS.jpg', dest: 'chile/chile-puerto-varas.jpg' },
  { src: 'CHILE/CHILE VALPO.jpg', dest: 'chile/chile-valpo.jpg' },
  { src: 'CHILE/CHILE 7.jpg', dest: 'chile/chile-7.jpg' },
  { src: 'PARAGUAY/ASUNCION.jpg', dest: 'paraguay/asuncion.jpg' },
  { src: 'PARAGUAY/Asuncion(1).jpg', dest: 'paraguay/asuncion-1.jpg' },
  { src: 'PARAGUAY/PY ENCARNACION.jpg', dest: 'paraguay/py-encarnacion.jpg' },
  { src: 'PARAGUAY/CIUDAD DEL ESTE PARAGUAY.png', dest: 'paraguay/cde-paraguay.png' }
];

filesToCopy.forEach(({ src, dest }) => {
  const srcFile = path.join(srcBase, src);
  const destFile = path.join(destBase, dest);
  
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${src} to ${destFile}`);
  } else {
    console.log(`File not found: ${srcFile}`);
  }
});
