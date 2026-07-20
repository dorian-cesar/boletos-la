const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\EQUIPO2\\Desktop\\WEB BOLETOS.LA 3.0\\RECURSOS GRAFICOS';

const copyMap = [
  // Features icons
  { src: 'ICON DESTINOS.png', dest: 'public/images/iconos-web/destinos-icon.png' },
  { src: 'ICON PAISES.png', dest: 'public/images/iconos-web/paises-icon.png' },
  { src: 'ICON PASAJEROS.png', dest: 'public/images/iconos-web/pasajeros-icon.png' },
  { src: 'ICON RUTAS.png', dest: 'public/images/iconos-web/rutas-icon.png' },
  
  // Logos
  // I will assume LOGO-01 is the main logo and LOGO-02 is the white/footer logo.
  { src: 'LOGO BOLETOS.LA-01.png', dest: 'public/logos/logo-boletos.png' },
  { src: 'LOGO BOLETOS.LA-02.png', dest: 'public/logos/logo-boletos-blanco.png' },
  
  // Favicon
  { src: 'favicon BOLETOS V3.png', dest: 'app/icon.png' }
];

copyMap.forEach(({ src, dest }) => {
  const srcFile = path.join(srcDir, src);
  const destFile = path.join(__dirname, dest);
  
  if (fs.existsSync(srcFile)) {
    // Ensure dir exists
    const dir = path.dirname(destFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied ${src} to ${dest}`);
  } else {
    console.log(`Not found: ${srcFile}`);
  }
});
