import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (!line.startsWith('#') && line.includes('=')) {
    const [key, value] = line.split('=');
    env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
  }
});

const serviceAccount = {
  type: "service_account",
  project_id: env.GOOGLE_PROJECT_ID,
  private_key_id: env.GOOGLE_PRIVATE_KEY_ID,
  private_key: env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'),
  client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  client_id: env.GOOGLE_CLIENT_ID,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://proradiobiz-default-rtdb.firebaseio.com"
});

const auth = admin.auth();

auth.createUser({
  email: 'difusionculturaluaaan@gmail.com',
  password: 'RadioBiz123!',
  displayName: 'RadioBiz Owner'
})
.then(() => {
  console.log('✅ Usuario creado');
  console.log('Email: difusionculturaluaaan@gmail.com');
  console.log('Contraseña: RadioBiz123!');
  process.exit(0);
})
.catch(error => {
  if (error.code === 'auth/email-already-exists') {
    console.log('✅ Usuario ya existe');
    console.log('Email: difusionculturaluaaan@gmail.com');
    console.log('Contraseña: RadioBiz123!');
  } else {
    console.error('Error:', error.message);
  }
  process.exit(0);
});
