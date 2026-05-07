#!/usr/bin/env node

/**
 * Script para crear usuario de prueba en Firebase (desarrollo local)
 * Uso: node scripts/create-demo-user.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const https = require('https');

const API_KEY = 'AIzaSyDgE9XssX6VT1SxQuDzR-FOnq4S7FE3Zcw';
const email = 'demo@radiobiz.com';
const password = 'Demo123456!';

const postData = JSON.stringify({
  email: email,
  password: password,
  returnSecureToken: true
});

const options = {
  hostname: 'identitytoolkit.googleapis.com',
  path: `/v1/accounts:signUp?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.idToken || response.localId) {
        console.log('\n✅ ¡Usuario creado exitosamente!\n');
        console.log('📧 Email:     ' + email);
        console.log('🔐 Contraseña: ' + password);
        console.log('\n🔗 Accede a: http://localhost:3000/login\n');
        process.exit(0);
      } else if (response.error?.message === 'EMAIL_EXISTS') {
        console.log('\n✅ ¡El usuario ya existe!\n');
        console.log('📧 Email:     ' + email);
        console.log('🔐 Contraseña: ' + password);
        console.log('\n🔗 Accede a: http://localhost:3000/login\n');
        process.exit(0);
      } else {
        console.log('\n❌ Error:', response.error?.message || response);
        process.exit(1);
      }
    } catch (e) {
      console.log('\n❌ Error al parsear respuesta:', e.message);
      console.log('Respuesta:', data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ Error de conexión:', e);
  process.exit(1);
});

req.write(postData);
req.end();
