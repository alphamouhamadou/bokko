import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pkg = await db.package.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true, waveBusinessLink: true },
            },
          },
        },
        sender: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ package: pkg })
  } catch (error: any) {
    console.error('Get package error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du colis' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus } = body

    const pkg = await db.package.findUnique({
      where: { id },
      include: {
        trip: true,
        sender: { select: { id: true, name: true } },
      },
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Update delivery status
    if (status) {
      const validStatuses = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Statut invalide' },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    // Update payment status
    if (paymentStatus) {
      const validPayments = ['PENDING', 'PAID', 'CONFIRMED_BY_DRIVER', 'CANCELLED']
      if (!validPayments.includes(paymentStatus)) {
        return NextResponse.json(
          { error: 'Statut de paiement invalide' },
          { status: 400 }
        )
      }
      updateData.paymentStatus = paymentStatus
      if (paymentStatus === 'PAID') {
        updateData.paidAt = new Date()
        // Accept paymentMethod from body, default to WAVE for backward compatibility
        const { paymentMethod } = body
        if (paymentMethod && ['CASH', 'WAVE'].includes(paymentMethod)) {
          updateData.paymentMethod = paymentMethod
        } else {
          updateData.paymentMethod = 'WAVE'
        }
      }
    }

    const updatedPkg = await db.package.update({
      where: { id },
      data: updateData,
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        sender: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    // Send notification to sender about status change
    try {
      if (status && status !== pkg.status) {
        const statusMessages: Record<string, string> = {
          ACCEPTED: 'Votre colis a été accepté par le chauffeur.',
          PICKED_UP: 'Votre colis a été récupéré et est en cours de livraison.',
          IN_TRANSIT: 'Votre colis est en transit vers la destination.',
          DELIVERED: 'Votre colis a été livré avec succès !',
          CANCELLED: 'La livraison de votre colis a été annulée.',
        }

        if (statusMessages[status]) {
          await db.notification.create({
            data: {
              userId: pkg.senderId,
              type: 'RESERVATION_CONFIRMED',
              title: `📦 Colis : ${statusMessages[status].split(' ').slice(0, 3).join(' ')}`,
              message: `${statusMessages[status]} (${pkg.description} — ${pkg.trip.origin} → ${pkg.trip.destination})`,
              data: JSON.stringify({ packageId: pkg.id, tripId: pkg.tripId }),
            },
          })
        }
      }

      // Notify driver when passenger pays for a package
      if (paymentStatus === 'PAID' && pkg.paymentStatus !== 'PAID') {
        const paymentMethodLabel = updateData.paymentMethod === 'CASH' ? 'en espèces' : 'via Wave'
        await db.notification.create({
          data: {
            userId: pkg.trip.driverId,
            type: 'NEW_RESERVATION',
            title: '💰 Paiement colis reçu',
            message: `${pkg.senderName} a effectué le paiement ${paymentMethodLabel} de ${pkg.amount.toLocaleString()} FCFA pour le colis "${pkg.description}" (${pkg.trip.origin} → ${pkg.trip.destination}).`,
            data: JSON.stringify({ packageId: pkg.id, tripId: pkg.tripId }),
          },
        })
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({ package: updatedPkg })
  } catch (error: any) {
    console.error('Update package error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du colis' },
      { status: 500 }
    )
  }
}
