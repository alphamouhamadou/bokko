import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : null
    const tripId = searchParams.get('tripId') || ''
    const toUserId = searchParams.get('toUserId') || ''

    const where: any = {}
    if (minScore) where.score = { gte: minScore }
    if (tripId) where.tripId = tripId
    if (toUserId) where.toUserId = toUserId

    const ratings = await db.rating.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: { select: { id: true, name: true, phone: true, role: true } },
        toUser: { select: { id: true, name: true, phone: true, role: true } },
        trip: { select: { id: true, origin: true, destination: true } },
      },
    })

    return NextResponse.json({ ratings })
  } catch (error: any) {
    console.error('Admin ratings error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des avis' },
      { status: 500 }
    )
  }
}
