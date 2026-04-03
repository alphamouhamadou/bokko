import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const senderId = searchParams.get('senderId')
    const driverId = searchParams.get('driverId')
    const tripId = searchParams.get('tripId')

    let packages

    if (senderId) {
      packages = await db.package.findMany({
        where: { senderId },
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
        orderBy: { createdAt: 'desc' },
      })
    } else if (driverId) {
      packages = await db.package.findMany({
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
          sender: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (tripId) {
      packages = await db.package.findMany({
        where: { tripId },
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
        orderBy: { createdAt: 'desc' },
      })
    } else {
      return NextResponse.json(
        { error: 'senderId, driverId ou tripId est requis' },
        { status: 400 }
      )
    }

    return NextResponse.json({ packages })
  } catch (error: any) {
    console.error('Get packages error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des colis' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tripId, senderId, description, weight, size,
      senderName, senderPhone, recipientName, recipientPhone,
      recipientAddress, amount, notes
    } = body

    if (!tripId || !senderId || !senderName || !senderPhone || !recipientName || !recipientPhone || !recipientAddress) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Verify trip exists and accepts packages
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: { driver: { select: { id: true, name: true } } },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'Trajet non trouvé' },
        { status: 404 }
      )
    }

    if (!trip.acceptsPackages) {
      return NextResponse.json(
        { error: 'Ce trajet n\'accepte pas de colis' },
        { status: 400 }
      )
    }

    // Calculate package amount: use provided amount or calculate weight * pricePerKg
    const packageAmount = amount || (parseFloat(weight) || 1) * trip.packagePricePerKg

    const pkg = await db.package.create({
      data: {
        tripId,
        senderId,
        description: description || 'Colis',
        weight: parseFloat(weight) || 1,
        size: size || 'M',
        senderName,
        senderPhone,
        recipientName,
        recipientPhone,
        recipientAddress,
        amount: packageAmount,
        notes: notes || null,
      },
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

    // Notify driver about new package
    try {
      await db.notification.create({
        data: {
          userId: trip.driverId,
          type: 'NEW_RESERVATION',
          title: '📦 Nouveau colis à livrer',
          message: `${senderName} souhaite envoyer un colis (${description}) de ${trip.origin} vers ${trip.destination}. Poids: ${weight}kg — ${packageAmount.toLocaleString()} FCFA.`,
          data: JSON.stringify({ packageId: pkg.id, tripId, senderId }),
        },
      })
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({ package: pkg }, { status: 201 })
  } catch (error: any) {
    console.error('Create package error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du colis' },
      { status: 500 }
    )
  }
}
