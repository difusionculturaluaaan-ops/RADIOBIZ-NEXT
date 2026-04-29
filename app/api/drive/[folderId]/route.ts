import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

interface ServiceAccountCredentials {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;

    if (!folderId || folderId === '.') {
      return NextResponse.json(
        { error: 'Invalid folder ID' },
        { status: 400 }
      );
    }

    // Initialize Google Drive API
    const credentials: ServiceAccountCredentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID || '',
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    };

    const auth = new google.auth.GoogleAuth({
      credentials: credentials as any,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // List files in folder, sorted by modification date (newest first)
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and (mimeType='audio/mpeg' or mimeType='audio/wav' or mimeType='audio/ogg' or mimeType='audio/mp4')`,
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime)',
      pageSize: 100,
      orderBy: 'modifiedTime desc',
    });

    const files: DriveFile[] = (response.data.files || []).map((file) => ({
      id: file.id || '',
      name: file.name || 'Unknown',
      modifiedTime: file.modifiedTime || new Date().toISOString(),
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: String(error) },
      { status: 500 }
    );
  }
}
