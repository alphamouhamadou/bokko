import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendDepartureReminder } from '@/lib/smsService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { passengerId } = body

    if (!passengerId) {
      return NextResponse.json(
        { error: 'passengerId est requis' },
        { status: 400 }
      )
    }

    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000)

    // Find CONFIRMED reservations where trip departure is within 30 min from now and in the future
    const upcomingReservations = await db.reservation.findMany({
      where: {
        passengerId,
        status: 'CONFIRMED',
        trip: {
          departureTime: {
            gte: now,
            lte: thirtyMinutesFromNow,
          },
        },
      },
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    let newRemindersCount = 0

    for (const reservation of upcomingReservations) {
      // Check if a DEPARTURE_REMINDER notification already exists for this trip+user
      const existingReminder = await db.notification.findFirst({
        where: {
          userId: passengerId,
          type: 'DEPARTURE_REMINDER',
          data: JSON.stringify({ tripId: reservation.tripId, reservationId: reservation.id }),
        },
      })

      if (!existingReminder) {
        // Create the notification
        await db.notification.create({
          data: {
            userId: passengerId,
            type: 'DEPARTURE_REMINDER',
            title: 'Rappel de départ',
            message: `Votre trajet ${reservation.trip.origin} → ${reservation.trip.destination} avec ${reservation.trip.driver.name} part à ${reservation.trip.departureTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
            data: JSON.stringify({ tripId: reservation.tripId, reservationId: reservation.id }),
          },
        })

        // Fire-and-forget SMS departure reminder
        try { sendDepartureReminder(passengerId, reservation.tripId) } catch {}

        newRemindersCount++
      }
    }

    return NextResponse.json({ newRemindersCount })
  } catch (error: any) {
    console.error('Check departure reminders error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des rappels' },
      { status: 500 }
    )
  }
}
