import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const twoHoursAgo = new Date()
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)

    const result = await db.reservation.updateMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: twoHoursAgo,
        },
      },
      data: {
        status: 'CANCELLED',
      },
    })

    console.log(`[Cron] Auto-rejected ${result.count} pending reservations older than 2h`)

    return NextResponse.json({
      success: true,
      cancelledCount: result.count,
      message: `${result.count} réservation(s) expirée(s) auto-annulée(s)`,
    })
  } catch (error: any) {
    console.error('[Cron] Auto-reject error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'auto-annulation' },
      { status: 500 }
    )
  }
}
