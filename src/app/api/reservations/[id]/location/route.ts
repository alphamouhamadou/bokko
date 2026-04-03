import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET - Récupérer la position temps réel du passager pour une réservation
 * Le passager envoie sa position via POST, le chauffeur la lit via GET
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { passenger: { select: { id: true, name: true, phone: true } } },
    })
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Get latest location from passenger's notifications
    const locNotification = await db.notification.findFirst({
      where: { userId: reservation.passengerId, type: 'LIVE_LOCATION' },
      orderBy: { createdAt: 'desc' },
    })

    if (!locNotification?.data) {
      return NextResponse.json({ sharing: false, passenger: reservation.passenger })
    }

    const locationData = JSON.parse(locNotification.data)
    // Check if location is less than 5 minutes old
    const age = Date.now() - new Date(locationData.updatedAt).getTime()
    const isRecent = age < 5 * 60 * 1000

    return NextResponse.json({
      sharing: isRecent,
      passenger: reservation.passenger,
      location: isRecent ? {
        lat: locationData.lat,
        lon: locationData.lon,
        address: locationData.address,
        updatedAt: locationData.updatedAt,
      } : null,
    })
  } catch (error: any) {
    console.error('Get live location error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

/**
 * POST - Passager envoie sa position temps réel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { passengerId, lat, lon, address } = body

    if (!passengerId || lat === undefined || lon === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const reservation = await db.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    // Update live location notification
    await db.notification.deleteMany({
      where: { userId: passengerId, type: 'LIVE_LOCATION' },
    })

    await db.notification.create({
      data: {
        userId: passengerId,
        type: 'LIVE_LOCATION',
        title: '📍 Position en direct',
        message: address || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
        data: JSON.stringify({
          lat, lon, address,
          reservationId: id,
          updatedAt: new Date().toISOString(),
        }),
        read: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Share live location error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
