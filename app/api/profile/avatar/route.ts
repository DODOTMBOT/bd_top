import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/profile/avatar - загрузка аватара');
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    console.log('File received:', file ? { name: file.name, size: file.size, type: file.type } : 'No file');

    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `avatar-${timestamp}.${extension}`;

    console.log('Generated filename:', filename);

    // Создаем папку uploads если её нет
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    console.log('Uploads directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory');
      await mkdir(uploadsDir, { recursive: true });
    }

    // Сохраняем файл
    const filepath = join(uploadsDir, filename);
    console.log('Saving file to:', filepath);
    await writeFile(filepath, buffer);

    // Возвращаем URL файла
    const fileUrl = `/uploads/${filename}`;
    console.log('File URL:', fileUrl);
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: filename 
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}