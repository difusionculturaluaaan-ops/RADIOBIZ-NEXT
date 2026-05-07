const admin = require('firebase-admin');
const path = require('path');

// Parse .env.local
const fs = require('fs');
const envLocal = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envLocal.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#')) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
});

const serviceAccount = {
  type: "service_account",
  project_id: envVars.GOOGLE_PROJECT_ID,
  private_key_id: envVars.GOOGLE_PRIVATE_KEY_ID,
  private_key: envVars.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'),
  client_email: envVars.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  client_id: envVars.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://proradiobiz-default-rtdb.firebaseio.com"
});

const auth = admin.auth();

// Create demo user
auth.createUser({
  email: 'difusionculturaluaaan@gmail.com',
  password: 'RadioBiz123!',
  displayName: 'RadioBiz Owner'
})
.then(userRecord => {
  console.log('✅ Usuario creado exitosamente:');
  console.log('   Email:', userRecord.email);
  console.log('   UID:', userRecord.uid);
  console.log('\n📝 Usa estas credenciales para login:');
  console.log('   Email: difusionculturaluaaan@gmail.com');
  console.log('   Contraseña: RadioBiz123!');
  process.exit(0);
})
.catch(error => {
  if (error.code === 'auth/email-already-exists') {
    console.log('✅ Usuario ya existe');
    console.log('   Email: difusionculturaluaaan@gmail.com');
    console.log('   Contraseña: RadioBiz123!');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
});
