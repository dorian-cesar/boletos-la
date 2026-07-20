const fs = require('fs');
const path = require('path');

const srcBase = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\RECURSOS IMAGENES';
const destBase = path.join(__dirname, 'public', 'images', 'destinations');

const filesToCopy = [
  { src: 'ARGENTINA/ARG BARILOCHE.jpg', dest: 'argentina-bariloche.jpg' },
  { src: 'ARGENTINA/ARG MENDOZA.jpg', dest: 'argentina-mendoza.jpg' },
  { src: 'ARGENTINA/ARG MAR DEL PLATA.jpg', dest: 'argentina-mar-del-plata.jpg' },
  { src: 'BRASIL/BRASIL RIO.jpg', dest: 'brasil-rio.jpg' },
  { src: 'BRASIL/BRASIL SAO PAULO.jpg', dest: 'brasil-sao-paulo.jpg' },
  { src: 'BRASIL/BRASIL SALVADOR.jpg', dest: 'brasil-salvador.jpg' },
  { src: 'CHILE/CHILE VALPO.jpg', dest: 'chile-valparaiso.jpg' },
  { src: 'CHILE/CHILE PUERTO VARAS.jpg', dest: 'chile-puerto-varas.jpg' },
  { src: 'CHILE/CHILE SERENA.jpg', dest: 'chile-la-serena.jpg' },
  { src: 'COLOMBIA/COLOMBIA CARTAGENA.jpg', dest: 'colombia-cartagena.jpg' },
  { src: 'COLOMBIA/COLOMBIA MEDELLIN.jpg', dest: 'colombia-medellin.jpg' },
  { src: 'COLOMBIA/COLOMBIA CALI.jpeg', dest: 'colombia-cali.jpeg' },
  { src: 'PARAGUAY/PY SAN BER.jpg', dest: 'paraguay-san-bernardino.jpg' },
  { src: 'PARAGUAY/PY ENCARNACION.jpg', dest: 'paraguay-encarnacion.jpg' },
  { src: 'PARAGUAY/CDE.jpg', dest: 'paraguay-ciudad-del-este.jpg' },
];

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

filesToCopy.forEach(({ src, dest }) => {
  const srcFile = path.join(srcBase, src);
  const destFile = path.join(destBase, dest);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${src} to ${destFile}`);
  } else {
    console.log(`File not found: ${srcFile}`);
  }
});
