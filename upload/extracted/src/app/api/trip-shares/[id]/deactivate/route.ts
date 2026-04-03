import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const share = await db.tripShare.findUnique({ where: { id } })
    if (!share) {
      return NextResponse.json({ error: 'Partage non trouvé' }, { status: 404 })
    }

    await db.tripShare.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Deactivate share error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
