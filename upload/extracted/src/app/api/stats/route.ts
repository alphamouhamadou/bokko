import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')

    if (!driverId) {
      return NextResponse.json(
        { error: 'driverId est requis' },
        { status: 400 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const totalTrips = await db.trip.count({
      where: { driverId },
    })

    const todayTrips = await db.trip.count({
      where: {
        driverId,
        departureTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const activeTrips = await db.trip.count({
      where: { driverId, status: 'ACTIVE' },
    })

    const allTrips = await db.trip.findMany({
      where: { driverId },
      include: {
        reservations: {
          where: { status: 'CONFIRMED' },
        },
      },
    })

    const totalReservations = allTrips.reduce(
      (sum, t) => sum + t.reservations.length,
      0
    )

    const todayTripsData = allTrips.filter(
      (t) => t.departureTime >= today && t.departureTime < tomorrow
    )
    const todayReservations = todayTripsData.reduce(
      (sum, t) => sum + t.reservations.length,
      0
    )

    const totalEarnings = allTrips.reduce(
      (sum, t) =>
        sum +
        t.reservations.reduce((rSum, r) => rSum + r.seatsBooked * t.pricePerSeat, 0),
      0
    )

    const todayEarnings = todayTripsData.reduce(
      (sum, t) =>
        sum +
        t.reservations.reduce((rSum, r) => rSum + r.seatsBooked * t.pricePerSeat, 0),
      0
    )

    const pendingReservations = await db.reservation.count({
      where: {
        trip: { driverId },
        status: 'PENDING',
      },
    })

    const confirmedPayments = await db.reservation.count({
      where: {
        trip: { driverId },
        paymentStatus: 'CONFIRMED_BY_DRIVER',
      },
    })

    // Package stats
    const pendingPackages = await db.package.count({
      where: {
        trip: { driverId },
        status: 'PENDING',
      },
    })

    const activePackages = await db.package.count({
      where: {
        trip: { driverId },
        status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] },
      },
    })

    const packageEarnings = await db.package.aggregate({
      where: {
        trip: { driverId },
        paymentStatus: 'CONFIRMED_BY_DRIVER',
      },
      _sum: { amount: true },
    })

    return NextResponse.json({
      stats: {
        totalTrips,
        todayTrips,
        activeTrips,
        totalReservations,
        todayReservations,
        totalEarnings,
        todayEarnings,
        pendingReservations,
        confirmedPayments,
        pendingPackages,
        activePackages,
        packageEarnings: packageEarnings._sum.amount || 0,
      },
    })
  } catch (error: any) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
