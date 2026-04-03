import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const passengerId = searchParams.get('passengerId')
    const driverId = searchParams.get('driverId')

    let reservations

    if (passengerId) {
      reservations = await db.reservation.findMany({
        where: { passengerId },
        include: {
          trip: {
            include: {
              driver: {
                select: { id: true, name: true, phone: true, waveBusinessLink: true },
              },
            },
          },
          passenger: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (driverId) {
      reservations = await db.reservation.findMany({
        where: {
          trip: { driverId },
        },
        include: {
          trip: {
            include: {
              driver: {
                select: { id: true, name: true, phone: true, waveBusinessLink: true },
              },
            },
          },
          passenger: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      return NextResponse.json(
        { error: 'passengerId ou driverId est requis' },
        { status: 400 }
      )
    }

    return NextResponse.json({ reservations })
  } catch (error: any) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, passengerId, seatsBooked, exactDestination } = body

    if (!tripId || !passengerId) {
      return NextResponse.json(
        { error: 'tripId et passengerId sont requis' },
        { status: 400 }
      )
    }

    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        driver: { select: { id: true, name: true } },
        reservations: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trajet non trouvé' },
        { status: 404 }
      )
    }

    if (trip.driverId === passengerId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas réserver votre propre trajet' },
        { status: 400 }
      )
    }

    const totalBooked = trip.reservations.reduce((sum, r) => sum + r.seatsBooked, 0)
    const seats = parseInt(seatsBooked) || 1

    if (totalBooked + seats > trip.availableSeats) {
      return NextResponse.json(
        { error: 'Places insuffisantes pour ce trajet' },
        { status: 400 }
      )
    }

    const existingReservation = await db.reservation.findFirst({
      where: {
        tripId,
        passengerId,
        status: { not: 'CANCELLED' },
      },
    })

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Vous avez déjà une réservation active pour ce trajet' },
        { status: 409 }
      )
    }

    const passenger = await db.user.findUnique({ where: { id: passengerId } })

    const reservation = await db.reservation.create({
      data: {
        tripId,
        passengerId,
        seatsBooked: seats,
        exactDestination: exactDestination || null,
      },
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        passenger: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    // Notify driver about new reservation
    try {
      await db.notification.create({
        data: {
          userId: trip.driverId,
          type: 'NEW_RESERVATION',
          title: 'Nouvelle réservation',
          message: `${passenger?.name || 'Un passager'} a réservé ${seats} place${seats > 1 ? 's' : ''} pour votre trajet ${trip.origin} → ${trip.destination}${exactDestination ? ` (${exactDestination})` : ''}.`,
          data: JSON.stringify({ reservationId: reservation.id, tripId, passengerId }),
        },
      })
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error: any) {
    console.error('Create reservation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réservation' },
      { status: 500 }
    )
  }
}
