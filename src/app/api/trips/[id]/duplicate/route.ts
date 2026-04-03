import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const originalTrip = await db.trip.findUnique({
      where: { id },
    })

    if (!originalTrip) {
      return NextResponse.json(
        { error: 'Trajet non trouvé' },
        { status: 404 }
      )
    }

    // Create new trip with same data, departure time = tomorrow same time
    const originalDate = new Date(originalTrip.departureTime)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0)

    const newTrip = await db.trip.create({
      data: {
        driverId: originalTrip.driverId,
        origin: originalTrip.origin,
        destination: originalTrip.destination,
        departureTime: tomorrow,
        pricePerSeat: originalTrip.pricePerSeat,
        availableSeats: originalTrip.availableSeats,
        tripType: originalTrip.tripType,
        status: 'ACTIVE',
        description: originalTrip.description,
        acceptsPackages: originalTrip.acceptsPackages,
        packagePricePerKg: originalTrip.packagePricePerKg,
      },
    })

    return NextResponse.json({
      success: true,
      trip: newTrip,
      message: 'Trajet dupliqué pour demain',
    })
  } catch (error: any) {
    console.error('Duplicate trip error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la duplication du trajet' },
      { status: 500 }
    )
  }
}
