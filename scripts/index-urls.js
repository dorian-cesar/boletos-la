/**
 * Script de Indexación Automatizada para Boletos.la
 * 
 * Uso:
 * 1. Para enviar por IndexNow (Bing, Yandex, Seznam):
 *    node scripts/index-urls.js --provider=indexnow --key=TU_INDEXNOW_KEY
 * 
 * 2. Para enviar por Google Indexing API:
 *    node scripts/index-urls.js --provider=google --keyfile=./service-account.json
 * 
 * 3. Para verificar y listar las URLs parseadas de url.txt:
 *    node scripts/index-urls.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value || true;
    }
  });
  return args;
}

function loadUrls() {
  const filePath = path.join(process.cwd(), 'url.txt');
  if (!fs.existsSync(filePath)) {
    console.error('❌ No se encontró el archivo url.txt en la raíz del proyecto.');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const urls = lines.filter(l => l.toUpperCase() !== 'URL' && l.startsWith('http'));
  return urls;
}

async function sendIndexNow(urls, apiKey) {
  if (!apiKey) {
    console.error('❌ Debes proporcionar tu IndexNow key usando --key=TU_KEY');
    process.exit(1);
  }

  const host = 'boletos.la';
  const payload = JSON.stringify({
    host: host,
    key: apiKey,
    keyLocation: `https://${host}/${apiKey}.txt`,
    urlList: urls
  });

  console.log(`🚀 Enviando ${urls.length} URLs a IndexNow (Bing/Yandex)...`);

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`✅ ¡Éxito! URLs notificadas correctamente a IndexNow (HTTP ${res.statusCode}).`);
          resolve(true);
        } else {
          console.error(`⚠️ Respuesta inesperada de IndexNow (HTTP ${res.statusCode}):`, data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Error al enviar petición a IndexNow:', e.message);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = parseArgs();
  const urls = loadUrls();

  console.log(`================================================`);
  console.log(`📊 Indexador Masivo Boletos.la`);
  console.log(`Total URLs encontradas en url.txt: ${urls.length}`);
  console.log(`================================================\n`);

  if (args['dry-run']) {
    console.log('🔍 MODO PRUEBA (DRY RUN): Listando las primeras 10 URLs:');
    urls.slice(0, 10).forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    console.log(`\n... y ${urls.length - 10} URLs más.`);
    console.log('\n📌 Para notificar vía IndexNow usa: node scripts/index-urls.js --provider=indexnow --key=TU_KEY');
    return;
  }

  const provider = args.provider || 'indexnow';

  if (provider === 'indexnow') {
    await sendIndexNow(urls, args.key);
  } else if (provider === 'google') {
    console.log('📌 Para la API de Google Indexing, instala `googleapis` y configura tu `service-account.json`.');
    console.log('Visita https://developers.google.com/search/apis/indexing-api/v3/prereqs para habilitar las credenciales.');
  } else {
    console.error(`❌ Proveedor no soportado: ${provider}. Usa --provider=indexnow o --provider=google`);
  }
}

main().catch(err => {
  console.error('Error durante la ejecución:', err);
});
