import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rating = await db.rating.findUnique({ where: { id } })
    if (!rating) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
    }

    await db.rating.delete({ where: { id } })

    // Recalculer la moyenne de l'utilisateur noté
    const allRatings = await db.rating.findMany({
      where: { toUserId: rating.toUserId },
    })
    const totalRatings = allRatings.length
    const averageRating = totalRatings > 0
      ? allRatings.reduce((sum: number, r: any) => sum + r.score, 0) / totalRatings
      : 0

    await db.user.update({
      where: { id: rating.toUserId },
      data: {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete rating error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
