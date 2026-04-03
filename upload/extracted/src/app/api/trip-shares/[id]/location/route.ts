import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { progress } = body

    const share = await db.tripShare.findUnique({ where: { id } })
    if (!share) {
      return NextResponse.json({ error: 'Partage non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      progress: Math.min(100, Math.max(0, progress || 0)),
    })
  } catch (error: any) {
    console.error('Update share location error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
