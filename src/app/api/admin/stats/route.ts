import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    const [
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalTrips,
      activeTrips,
      totalReservations,
      pendingReservations,
      totalPackages,
      pendingPackages,
      blockedUsers,
      pendingReports,
      ratings,
      reservationsPaid,
      packagesPaid,
      todayUsers,
      weekUsers,
      todayTrips,
      weekTrips,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'DRIVER' } }),
      db.user.count({ where: { role: 'PASSENGER' } }),
      db.trip.count(),
      db.trip.count({ where: { status: 'ACTIVE' } }),
      db.reservation.count(),
      db.reservation.count({ where: { status: 'PENDING' } }),
      db.package.count(),
      db.package.count({ where: { status: 'PENDING' } }),
      db.user.count({ where: { isBlocked: true } }),
      db.report.count({ where: { status: 'PENDING' } }),
      db.rating.findMany(),
      db.reservation.findMany({ where: { paymentStatus: 'PAID' } }),
      db.package.findMany({ where: { paymentStatus: 'PAID' } }),
      db.user.count({ where: { createdAt: { gte: todayStart } } }),
      db.user.count({ where: { createdAt: { gte: weekStart } } }),
      db.trip.count({ where: { departureTime: { gte: todayStart } } }),
      db.trip.count({ where: { departureTime: { gte: weekStart } } }),
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, phone: true, role: true, createdAt: true, isBlocked: true },
      }),
    ])

    // Calcul revenus totaux
    const totalEarnings = reservationsPaid.reduce((sum: number, r: any) => {
      return sum + (r.seatsBooked || 1) * 0 // will recalc with trip price
    }, 0)

    // Revenus depuis réservations payées
    let revenueFromReservations = 0
    for (const r of reservationsPaid) {
      const trip = await db.trip.findUnique({ where: { id: r.tripId }, select: { pricePerSeat: true } })
      revenueFromReservations += (trip?.pricePerSeat || 0) * (r.seatsBooked || 1)
    }

    const revenueFromPackages = packagesPaid.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
    const totalRevenue = revenueFromReservations + revenueFromPackages

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length
      : 0

    // Données de croissance sur 6 mois
    const monthlyGrowth: { month: string; users: number; trips: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      const monthUsers = await db.user.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      })
      const monthTrips = await db.trip.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } },
      })
      monthlyGrowth.push({ month: monthName, users: monthUsers, trips: monthTrips })
    }

    return NextResponse.json({
      totalUsers,
      totalDrivers,
      totalPassengers,
      totalTrips,
      activeTrips,
      totalReservations,
      pendingReservations,
      totalPackages,
      pendingPackages,
      blockedUsers,
      pendingReports,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      todayUsers,
      weekUsers,
      todayTrips,
      weekTrips,
      recentUsers,
      monthlyGrowth,
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    )
  }
}
