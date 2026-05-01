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
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // List files in folder and all subfolders
    // We search for audio files that have this folder as a parent
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, mimeType, modifiedTime)',
      pageSize: 500,
      orderBy: 'modifiedTime desc',
    });

    // Filter to only audio files, but also recursively get files from folders
    const audioMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
    const files: DriveFile[] = [];

    // Add direct audio files
    (response.data.files || []).forEach((file) => {
      if (audioMimeTypes.includes(file.mimeType || '')) {
        files.push({
          id: file.id || '',
          name: file.name || 'Unknown',
          modifiedTime: file.modifiedTime || new Date().toISOString(),
        });
      }
    });

    // For subfolders, get their contents
    const subfolders = (response.data.files || []).filter(
      (f) => f.mimeType === 'application/vnd.google-apps.folder'
    );

    for (const subfolder of subfolders) {
      if (!subfolder.id) continue;
      try {
        const subResponse = await drive.files.list({
          q: `'${subfolder.id}' in parents and trashed=false`,
          spaces: 'drive',
          fields: 'files(id, name, mimeType, modifiedTime)',
          pageSize: 500,
        });

        (subResponse.data.files || []).forEach((file) => {
          if (audioMimeTypes.includes(file.mimeType || '')) {
            files.push({
              id: file.id || '',
              name: file.name || 'Unknown',
              modifiedTime: file.modifiedTime || new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        // Skip folders that fail
        console.warn(`Could not list subfolder ${subfolder.id}:`, String(e));
      }
    }

    // Sort all files by modification time (newest first)
    files.sort((a, b) =>
      new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: String(error) },
      { status: 500 }
    );
  }
}
