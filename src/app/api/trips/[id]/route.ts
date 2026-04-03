import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const trip = await db.trip.findUnique({
      where: { id },
      include: {
        driver: {
          include: { vehicle: true },
        },
        reservations: {
          include: {
            passenger: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trajet non trouvé' },
        { status: 404 }
      )
    }

    const totalBooked = trip.reservations
      .filter((r) => r.status !== 'CANCELLED')
      .reduce((sum, r) => sum + r.seatsBooked, 0)

    const { driver, reservations, ...rest } = trip

    return NextResponse.json({
      trip: {
        ...rest,
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          role: driver.role,
          waveBusinessLink: driver.waveBusinessLink,
        },
        vehicle: driver.vehicle,
        reservations,
        totalBooked,
        remainingSeats: trip.availableSeats - totalBooked,
        reservationCount: trip.reservations.length,
        activeReservations: trip.reservations.filter((r) => r.status === 'CONFIRMED').length,
        pendingReservations: trip.reservations.filter((r) => r.status === 'PENDING').length,
      },
    })
  } catch (error: any) {
    console.error('Get trip error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du trajet' },
      { status: 500 }
    )
  }
}
