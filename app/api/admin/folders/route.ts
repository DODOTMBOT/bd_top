import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/utils/transliterate'

const createFolderSchema = z.object({
  name: z.string().min(1, 'Название папки обязательно'),
})

// POST - создать папку
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name } = createFolderSchema.parse(body)

    // Генерируем slug из названия
    let slug = generateSlug(name)
    
    // Проверяем уникальность slug и добавляем номер если нужно
    let counter = 1
    let originalSlug = slug
    
    while (true) {
      const existingFolder = await prisma.folder.findUnique({
        where: { slug },
      })

      if (!existingFolder) {
        break
      }
      
      slug = `${originalSlug}-${counter}`
      counter++
    }

    // Получаем максимальный order для новой папки
    const maxOrder = await prisma.folder.aggregate({
      _max: { order: true },
    })

    const newOrder = (maxOrder._max.order || 0) + 1

    // Создаем папку
    const folder = await prisma.folder.create({
      data: {
        name,
        slug,
        order: newOrder,
      },
    })

    return NextResponse.json({ 
      success: true, 
      folder 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Ошибка создания папки' },
      { status: 500 }
    )
  }
}
