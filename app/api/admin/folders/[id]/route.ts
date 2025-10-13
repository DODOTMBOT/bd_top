import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - удалить папку
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { confirm } = body

    // Проверяем, существует ли папка
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { 
        pages: true,
        _count: {
          select: {
            pages: true
          }
        }
      },
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Папка не найдена' },
        { status: 404 }
      )
    }

    // Запрещаем удаление папки 'hidden'
    if (folder.slug === 'hidden') {
      return NextResponse.json(
        { error: 'CANNOT_DELETE_SYSTEM_FOLDER' },
        { status: 400 }
      )
    }

    // Проверяем, есть ли содержимое в папке
    const hasContent = folder.pages.length > 0

    // Если есть содержимое и нет подтверждения
    if (hasContent && confirm !== true) {
      return NextResponse.json(
        { error: 'FOLDER_NOT_EMPTY_CONFIRM_REQUIRED' },
        { status: 400 }
      )
    }

    // Удаляем папку и всё содержимое в транзакции
    await prisma.$transaction(async (tx) => {
      // Сначала удаляем все страницы в папке
      if (folder.pages.length > 0) {
        await tx.page.deleteMany({
          where: { folderId: id }
        })
      }

      // Затем удаляем саму папку
      await tx.folder.delete({
        where: { id }
      })
    })

    return NextResponse.json({ 
      success: true,
      message: 'Папка и всё содержимое успешно удалены'
    })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json(
      { error: 'Ошибка удаления папки' },
      { status: 500 }
    )
  }
}
