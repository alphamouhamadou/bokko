import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toUserId = searchParams.get('toUserId')

    if (!toUserId) {
      return NextResponse.json({ error: 'toUserId est requis' }, { status: 400 })
    }

    const ratings = await db.rating.findMany({
      where: { toUserId },
      include: {
        fromUser: { select: { id: true, name: true } },
        trip: { select: { id: true, origin: true, destination: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ratings })
  } catch (error: any) {
    console.error('Get ratings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromUserId, toUserId, tripId, score, comment } = body

    if (!fromUserId || !toUserId || !tripId || !score) {
      return NextResponse.json(
        { error: 'fromUserId, toUserId, tripId et score sont requis' },
        { status: 400 }
      )
    }

    if (score < 1 || score > 5) {
      return NextResponse.json({ error: 'Le score doit être entre 1 et 5' }, { status: 400 })
    }

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous noter vous-même' }, { status: 400 })
    }

    const existingRating = await db.rating.findFirst({
      where: { fromUserId, tripId },
    })

    if (existingRating) {
      return NextResponse.json(
        { error: 'Vous avez déjà noté ce trajet' },
        { status: 409 }
      )
    }

    const rating = await db.rating.create({
      data: {
        fromUserId,
        toUserId,
        tripId,
        score: parseInt(score),
        comment: comment || null,
      },
      include: {
        fromUser: { select: { id: true, name: true } },
        trip: { select: { id: true, origin: true, destination: true } },
      },
    })

    // Update driver average rating
    const allRatings = await db.rating.findMany({ where: { toUserId } })
    const avgScore = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length

    await db.user.update({
      where: { id: toUserId },
      data: {
        averageRating: Math.round(avgScore * 10) / 10,
        totalRatings: allRatings.length,
      },
    })

    return NextResponse.json({ rating }, { status: 201 })
  } catch (error: any) {
    console.error('Create rating error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la note' },
      { status: 500 }
    )
  }
}
