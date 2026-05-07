import { NextRequest, NextResponse } from 'next/server';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

export async function POST(req: NextRequest) {
  try {
    // Validate it's a local request (development only)
    const host = req.headers.get('host') || '';
    if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
      return NextResponse.json(
        { error: 'Este endpoint solo funciona en desarrollo local' },
        { status: 403 }
      );
    }

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    // Initialize Firebase app
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const email = 'demo@radiobiz.com';
    const password = 'Demo123456!';

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return NextResponse.json({
        success: true,
        message: 'Usuario de prueba creado exitosamente',
        email,
        password,
        note: 'Este usuario solo existe en desarrollo local'
      });
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        return NextResponse.json({
          success: true,
          message: 'El usuario de prueba ya existe',
          email,
          password,
          note: 'Usa estas credenciales para loguear'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating demo user:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario de prueba' },
      { status: 500 }
    );
  }
}
