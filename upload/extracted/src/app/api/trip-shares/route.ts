import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const passengerId = searchParams.get('passengerId')

    if (code) {
      const share = await db.tripShare.findUnique({
        where: { shareCode: code.toUpperCase() },
        include: {
          trip: {
            include: {
              driver: { select: { id: true, name: true, phone: true, photoUrl: true } },
            },
          },
          passenger: { select: { id: true, name: true } },
        },
      })

      if (!share || !share.isActive) {
        return NextResponse.json({ error: 'Partage non trouvé ou expiré' }, { status: 404 })
      }
      return NextResponse.json({ share })
    }

    if (passengerId) {
      const shares = await db.tripShare.findMany({
        where: { passengerId, isActive: true },
        include: {
          trip: {
            include: {
              driver: { select: { id: true, name: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ shares })
    }

    return NextResponse.json({ error: 'Paramètre code ou passengerId requis' }, { status: 400 })
  } catch (error: any) {
    console.error('Get trip shares error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, passengerId } = body

    if (!tripId || !passengerId) {
      return NextResponse.json(
        { error: 'tripId et passengerId sont requis' },
        { status: 400 }
      )
    }

    const trip = await db.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 })
    }

    // Check for existing active share
    const existingShare = await db.tripShare.findFirst({
      where: { tripId, passengerId, isActive: true },
    })

    if (existingShare) {
      const shareWithTrip = await db.tripShare.findUnique({
        where: { id: existingShare.id },
        include: {
          trip: { include: { driver: { select: { id: true, name: true, phone: true } } } },
        },
      })
      return NextResponse.json({ share: shareWithTrip })
    }

    // Generate unique 6-char code
    let shareCode = ''
    let isUnique = false
    while (!isUnique) {
      shareCode = crypto.randomBytes(3).toString('hex').toUpperCase()
      const exists = await db.tripShare.findUnique({ where: { shareCode } })
      if (!exists) isUnique = true
    }

    const share = await db.tripShare.create({
      data: { tripId, passengerId, shareCode },
      include: {
        trip: { include: { driver: { select: { id: true, name: true, phone: true } } } },
      },
    })

    return NextResponse.json({ share }, { status: 201 })
  } catch (error: any) {
    console.error('Create trip share error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
