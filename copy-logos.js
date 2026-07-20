const fs = require('fs');
const path = require('path');

const srcDirComercios = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\LOGOS COMERCIOS';
const srcDirPagos = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\LOGOS MEDIOS DE PAGO';
const destBase = path.join(__dirname, 'public', 'logos');

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

// Copy Comercios
if (fs.existsSync(srcDirComercios)) {
  const comerciosDir = path.join(destBase, 'comercios');
  if (!fs.existsSync(comerciosDir)) fs.mkdirSync(comerciosDir, { recursive: true });
  
  fs.readdirSync(srcDirComercios).forEach(file => {
    fs.copyFileSync(path.join(srcDirComercios, file), path.join(comerciosDir, file.replace(/\s+/g, '-')));
    console.log(`Copied ${file}`);
  });
}

// Copy Pagos
if (fs.existsSync(srcDirPagos)) {
  const pagosDir = path.join(destBase, 'pagos');
  if (!fs.existsSync(pagosDir)) fs.mkdirSync(pagosDir, { recursive: true });
  
  fs.readdirSync(srcDirPagos).forEach(file => {
    fs.copyFileSync(path.join(srcDirPagos, file), path.join(pagosDir, file.replace(/\s+/g, '-')));
    console.log(`Copied ${file}`);
  });
}
