import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - получить статистику папки
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем, существует ли папка
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pages: true
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Папка не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      stats: {
        pagesCount: folder._count.pages,
        subfoldersCount: 0 // Пока нет вложенных папок
      }
    })
  } catch (error) {
    console.error('Error getting folder stats:', error)
    return NextResponse.json(
      { error: 'Ошибка получения статистики папки' },
      { status: 500 }
    )
  }
}
