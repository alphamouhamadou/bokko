import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const passengerId = searchParams.get('passengerId')

    if (!passengerId) {
      return NextResponse.json({ error: 'passengerId requis' }, { status: 400 })
    }

    const reservations = await db.reservation.findMany({
      where: { passengerId },
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const history = reservations.map((r) => ({
      id: r.id,
      status: r.status,
      paymentStatus: r.paymentStatus,
      seatsBooked: r.seatsBooked,
      amount: r.seatsBooked * r.trip.pricePerSeat,
      createdAt: r.createdAt,
      trip: {
        id: r.trip.id,
        origin: r.trip.origin,
        destination: r.trip.destination,
        departureTime: r.trip.departureTime,
        driverName: r.trip.driver.name,
      },
    }))

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('Passenger history error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement de l\'historique' },
      { status: 500 }
    )
  }
}
