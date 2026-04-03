import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const date = searchParams.get('date')
    const driverId = searchParams.get('driverId')

    const where: any = { status: 'ACTIVE' }

    if (origin) where.origin = origin
    if (destination) where.destination = destination
    if (driverId) where.driverId = driverId
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      where.departureTime = {
        gte: startDate,
        lt: endDate,
      }
    }

    const trips = await db.trip.findMany({
      where,
      include: {
        driver: {
          include: { vehicle: true },
        },
        reservations: {
          select: { id: true, status: true, seatsBooked: true },
        },
      },
      orderBy: { departureTime: 'asc' },
    })

    const tripsWithAvailability = trips.map((trip) => {
      const totalBooked = trip.reservations
        .filter((r) => r.status !== 'CANCELLED')
        .reduce((sum, r) => sum + r.seatsBooked, 0)
      const { reservations, driver, ...rest } = trip
      return {
        ...rest,
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          role: driver.role,
          waveBusinessLink: driver.waveBusinessLink,
        },
        vehicle: driver.vehicle,
        acceptsPackages: trip.acceptsPackages,
        packagePricePerKg: trip.packagePricePerKg,
        totalBooked,
        remainingSeats: trip.availableSeats - totalBooked,
      }
    })

    return NextResponse.json({ trips: tripsWithAvailability })
  } catch (error: any) {
    console.error('Get trips error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des trajets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverId, origin, destination, departureTime, pricePerSeat, availableSeats, tripType, description, acceptsPackages, packagePricePerKg } = body

    if (!driverId || !origin || !destination || !departureTime || !pricePerSeat || !availableSeats || !tripType) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    const driver = await db.user.findUnique({
      where: { id: driverId },
      include: { vehicle: true },
    })
    if (!driver || driver.role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Conducteur non trouvé' },
        { status: 404 }
      )
    }

    const trip = await db.trip.create({
      data: {
        driverId,
        origin,
        destination,
        departureTime: new Date(departureTime),
        pricePerSeat: parseInt(pricePerSeat),
        availableSeats: parseInt(availableSeats),
        tripType,
        description: description || null,
        acceptsPackages: acceptsPackages || false,
        packagePricePerKg: packagePricePerKg || 0,
      },
    })

    // Increment driver totalTrips
    await db.user.update({
      where: { id: driverId },
      data: { totalTrips: { increment: 1 } },
    })

    // Notify all passengers about new trip
    try {
      const passengers = await db.user.findMany({
        where: { role: 'PASSENGER' },
        select: { id: true },
      })

      const formattedTime = new Date(departureTime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })

      await db.notification.createMany({
        data: passengers.map((p) => ({
          userId: p.id,
          type: 'TRIP_AVAILABLE',
          title: 'Nouveau trajet disponible',
          message: `${driver.name} propose un trajet ${origin} → ${destination} le ${formattedTime} pour ${pricePerSeat} FCFA/place.`,
          data: JSON.stringify({ tripId: trip.id, driverId }),
        })),
      })
    } catch (notifErr) {
      console.error('Failed to send notifications:', notifErr)
    }

    return NextResponse.json({
      trip: {
        ...trip,
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          role: driver.role,
        },
        vehicle: driver.vehicle,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create trip error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du trajet' },
      { status: 500 }
    )
  }
}
