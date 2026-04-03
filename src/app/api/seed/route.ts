import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Check if data already exists
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Données déjà existantes' })
    }

    const password = await bcrypt.hash('password123', 10)

    // Create drivers
    const driver1 = await db.user.create({
      data: {
        phone: '771234567',
        password,
        name: 'Moussa Diop',
        role: 'DRIVER',
        licenseNumber: 'DL-2023-001',
        licenseExpiry: new Date('2026-06-15'),
        bio: 'Chauffeur professionnel depuis 5 ans sur la route Thiès-Dakar. Véhicule climatisé et bien entretenu. Ponctualité garantie.',
        experience: 5,
        totalTrips: 150,
        averageRating: 4.5,
        totalRatings: 45,
        waveBusinessLink: 'https://pay.wave.com/bokko-amadou',
      },
    })

    const driver2 = await db.user.create({
      data: {
        phone: '772345678',
        password,
        name: 'Amadou Fall',
        role: 'DRIVER',
        licenseNumber: 'DL-2023-002',
        licenseExpiry: new Date('2026-03-20'),
        bio: 'Conducteur expérimenté, je fais la route Thiès-Dakar quotidiennement. Très bon service.',
        experience: 8,
        totalTrips: 300,
        averageRating: 4.2,
        totalRatings: 78,
        waveBusinessLink: 'https://pay.wave.com/dakar-express',
      },
    })

    const driver3 = await db.user.create({
      data: {
        phone: '773456789',
        password,
        name: 'Ibrahima Sow',
        role: 'DRIVER',
        licenseNumber: 'DL-2024-003',
        licenseExpiry: new Date('2027-01-10'),
        bio: 'Chauffeur disponible sur Thiènaba-Dakar. Véhicule spacieux et confortable.',
        experience: 3,
        totalTrips: 80,
        averageRating: 4.8,
        totalRatings: 22,
        waveBusinessLink: 'https://pay.wave.com/thies-connect',
      },
    })

    const driver4 = await db.user.create({
      data: {
        phone: '774567890',
        password,
        name: 'Ousmane Ndiaye',
        role: 'DRIVER',
        licenseNumber: 'DL-2024-004',
        licenseExpiry: new Date('2027-05-30'),
        bio: 'Nouveau chauffeur BOKKO mais très professionnel. Je vous invite à essayer !',
        experience: 1,
        totalTrips: 25,
        averageRating: 3.8,
        totalRatings: 8,
        waveBusinessLink: null,
      },
    })

    // Create vehicles
    await db.vehicle.create({
      data: {
        brand: 'Toyota',
        model: 'Corolla',
        color: 'Blanc',
        plateNumber: 'DK-1234-A',
        capacity: 4,
        driverId: driver1.id,
      },
    })

    await db.vehicle.create({
      data: {
        brand: 'Mercedes',
        model: 'C-Class',
        color: 'Noir',
        plateNumber: 'DK-5678-B',
        capacity: 4,
        driverId: driver2.id,
      },
    })

    await db.vehicle.create({
      data: {
        brand: 'Hyundai',
        model: 'Tucson',
        color: 'Gris',
        plateNumber: 'DK-9012-C',
        capacity: 5,
        driverId: driver3.id,
      },
    })

    await db.vehicle.create({
      data: {
        brand: 'Renault',
        model: 'Duster',
        color: 'Rouge',
        plateNumber: 'DK-3456-D',
        capacity: 4,
        driverId: driver4.id,
      },
    })

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    await db.user.create({
      data: {
        phone: '770000000',
        password: adminPassword,
        name: 'Admin BOKKO',
        role: 'ADMIN',
      },
    })

    // Create passengers
    const passenger1 = await db.user.create({
      data: {
        phone: '781234567',
        password,
        name: 'Fatou Diallo',
        role: 'PASSENGER',
      },
    })

    const passenger2 = await db.user.create({
      data: {
        phone: '782345678',
        password,
        name: 'Aminata Ba',
        role: 'PASSENGER',
      },
    })

    // Create trips
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(7, 30, 0, 0)

    const tomorrowAfternoon = new Date()
    tomorrowAfternoon.setDate(tomorrowAfternoon.getDate() + 1)
    tomorrowAfternoon.setHours(16, 0, 0, 0)

    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(8, 0, 0, 0)

    const dayAfterAfternoon = new Date()
    dayAfterAfternoon.setDate(dayAfterAfternoon.getDate() + 2)
    dayAfterAfternoon.setHours(17, 30, 0, 0)

    const threeDays = new Date()
    threeDays.setDate(threeDays.getDate() + 3)
    threeDays.setHours(7, 0, 0, 0)

    const fourDays = new Date()
    fourDays.setDate(fourDays.getDate() + 4)
    fourDays.setHours(9, 0, 0, 0)

    const trip1 = await db.trip.create({
      data: {
        driverId: driver1.id,
        origin: 'Thiès',
        destination: 'Dakar',
        departureTime: tomorrow,
        pricePerSeat: 2500,
        availableSeats: 3,
        tripType: 'ALLER_SIMPLE',
        description: 'Départ à 7h30 de la gare de Thiès, arrivée vers 9h. Climatisation disponible.',
        status: 'ACTIVE',
      },
    })

    const trip2 = await db.trip.create({
      data: {
        driverId: driver2.id,
        origin: 'Thiès',
        destination: 'Dakar',
        departureTime: tomorrowAfternoon,
        pricePerSeat: 2500,
        availableSeats: 3,
        tripType: 'ALLER_SIMPLE',
        description: 'Retour de Thiès vers Dakar, départ vers 16h.',
        status: 'ACTIVE',
      },
    })

    const trip3 = await db.trip.create({
      data: {
        driverId: driver3.id,
        origin: 'Thiènaba',
        destination: 'Dakar',
        departureTime: dayAfter,
        pricePerSeat: 3000,
        availableSeats: 4,
        tripType: 'ALLER_SIMPLE',
        description: 'Trajet Thiènaba - Dakar. Départ à 8h.',
        status: 'ACTIVE',
      },
    })

    const trip4 = await db.trip.create({
      data: {
        driverId: driver4.id,
        origin: 'Dakar',
        destination: 'Thiès',
        departureTime: dayAfterAfternoon,
        pricePerSeat: 2500,
        availableSeats: 3,
        tripType: 'RETOUR_SIMPLE',
        description: 'Retour Dakar - Thiès, départ vers 17h30.',
        status: 'ACTIVE',
      },
    })

    const trip5 = await db.trip.create({
      data: {
        driverId: driver1.id,
        origin: 'Thiès',
        destination: 'Dakar',
        departureTime: threeDays,
        pricePerSeat: 2000,
        availableSeats: 3,
        tripType: 'ALLER_SIMPLE',
        description: 'Départ de Thiès à 7h vers Dakar.',
        status: 'ACTIVE',
      },
    })

    const trip6 = await db.trip.create({
      data: {
        driverId: driver3.id,
        origin: 'Thiènaba',
        destination: 'Dakar',
        departureTime: fourDays,
        pricePerSeat: 3000,
        availableSeats: 4,
        tripType: 'ALLER_RETOUR',
        description: 'Aller-retour Thiènaba - Dakar. Départ à 9h, retour le soir.',
        status: 'ACTIVE',
      },
    })

    // Create sample reservations
    const res1 = await db.reservation.create({
      data: {
        tripId: trip1.id,
        passengerId: passenger1.id,
        status: 'CONFIRMED',
        seatsBooked: 1,
        paymentStatus: 'CONFIRMED_BY_DRIVER',
        paymentMethod: 'WAVE',
        paidAt: new Date(),
        exactDestination: 'Dakar Plateau',
      },
    })

    const res2 = await db.reservation.create({
      data: {
        tripId: trip3.id,
        passengerId: passenger1.id,
        status: 'PENDING',
        seatsBooked: 1,
        paymentStatus: 'PAID',
        paymentMethod: 'WAVE',
        paidAt: new Date(),
        exactDestination: 'Dakar Almadies',
      },
    })

    await db.reservation.create({
      data: {
        tripId: trip1.id,
        passengerId: passenger2.id,
        status: 'PENDING',
        seatsBooked: 1,
        paymentStatus: 'PENDING',
        exactDestination: 'Dakar Liberté',
      },
    })

    // Create sample notifications for passenger1
    await db.notification.create({
      data: {
        userId: passenger1.id,
        type: 'RESERVATION_CONFIRMED',
        title: 'Réservation confirmée',
        message: 'Votre réservation pour le trajet Thiès → Dakar (Dakar Plateau) a été confirmée par Moussa Diop.',
        data: JSON.stringify({ reservationId: res1.id, tripId: trip1.id }),
        read: false,
      },
    })

    await db.notification.create({
      data: {
        userId: passenger1.id,
        type: 'TRIP_AVAILABLE',
        title: 'Nouveau trajet disponible',
        message: 'Ibrahima Sow propose un trajet Thiènaba → Dakar demain à 8h pour 3000 FCFA/place.',
        data: JSON.stringify({ tripId: trip3.id }),
        read: false,
      },
    })

    await db.notification.create({
      data: {
        userId: passenger1.id,
        type: 'NEW_RESERVATION',
        title: 'Réservation en attente',
        message: 'Votre réservation pour Thiènaba → Dakar (Dakar Almadies) est en attente de confirmation.',
        data: JSON.stringify({ reservationId: res2.id, tripId: trip3.id }),
        read: true,
      },
    })

    await db.notification.create({
      data: {
        userId: passenger1.id,
        type: 'TRIP_AVAILABLE',
        title: 'Nouveau trajet disponible',
        message: 'Moussa Diop propose un trajet Thiès → Dakar pour 2000 FCFA/place.',
        data: JSON.stringify({ tripId: trip5.id }),
        read: true,
      },
    })

    // Create notifications for driver1 (new reservation)
    await db.notification.create({
      data: {
        userId: driver1.id,
        type: 'NEW_RESERVATION',
        title: 'Nouvelle réservation',
        message: 'Aminata Ba a réservé 1 place pour votre trajet Thiès → Dakar (Dakar Liberté).',
        data: JSON.stringify({ tripId: trip1.id, passengerId: passenger2.id }),
        read: false,
      },
    })

    await db.notification.create({
      data: {
        userId: driver1.id,
        type: 'NEW_RESERVATION',
        title: 'Nouvelle réservation',
        message: 'Fatou Diallo a réservé 1 place pour votre trajet Thiès → Dakar (Dakar Plateau).',
        data: JSON.stringify({ tripId: trip1.id, passengerId: passenger1.id }),
        read: true,
      },
    })

    // Create sample ratings for driver1
    await db.rating.create({
      data: {
        fromUserId: passenger1.id,
        toUserId: driver1.id,
        tripId: trip1.id,
        score: 5,
        comment: 'Excellent chauffeur ! Très ponctuel et véhicule confortable. Je recommande vivement.',
      },
    })

    await db.rating.create({
      data: {
        fromUserId: passenger2.id,
        toUserId: driver1.id,
        tripId: trip5.id,
        score: 4,
        comment: 'Bon trajet, conduite agréable. Un peu de retard au départ.',
      },
    })

    // Create ratings for driver2
    await db.rating.create({
      data: {
        fromUserId: passenger1.id,
        toUserId: driver2.id,
        tripId: trip2.id,
        score: 4,
        comment: 'Mercedes très confortable. Chauffeur professionnel.',
      },
    })

    // Create ratings for driver3
    await db.rating.create({
      data: {
        fromUserId: passenger2.id,
        toUserId: driver3.id,
        tripId: trip3.id,
        score: 5,
        comment: 'Parfait ! Hyundai spacieux et climatisé. Le meilleur chauffeur.',
      },
    })

    await db.rating.create({
      data: {
        fromUserId: passenger1.id,
        toUserId: driver3.id,
        tripId: trip6.id,
        score: 5,
        comment: 'Très satisfait du service.',
      },
    })

    // Create an active trip share
    await db.tripShare.create({
      data: {
        tripId: trip1.id,
        passengerId: passenger1.id,
        shareCode: 'AD7X3K',
        isActive: true,
      },
    })

    // Update trip1 and trip3 to accept packages
    await db.trip.update({
      where: { id: trip1.id },
      data: { acceptsPackages: true, packagePricePerKg: 500 },
    })

    await db.trip.update({
      where: { id: trip3.id },
      data: { acceptsPackages: true, packagePricePerKg: 700 },
    })

    await db.trip.update({
      where: { id: trip5.id },
      data: { acceptsPackages: true, packagePricePerKg: 500 },
    })

    // Create sample packages
    await db.package.create({
      data: {
        tripId: trip1.id,
        senderId: passenger1.id,
        status: 'IN_TRANSIT',
        description: 'Sac de vêtements pour la famille',
        weight: 5,
        size: 'M',
        senderName: 'Fatou Diallo',
        senderPhone: '781234567',
        recipientName: 'Mariam Diop',
        recipientPhone: '779876543',
        recipientAddress: 'Dakar Plateau, près de la place de l\'Indépendance',
        amount: 2500,
        paymentStatus: 'CONFIRMED_BY_DRIVER',
        paymentMethod: 'WAVE',
        paidAt: new Date(),
      },
    })

    await db.package.create({
      data: {
        tripId: trip3.id,
        senderId: passenger2.id,
        status: 'PENDING',
        description: 'Carton de produits cosmétiques',
        weight: 10,
        size: 'L',
        senderName: 'Aminata Ba',
        senderPhone: '782345678',
        recipientName: 'Khady Sy',
        recipientPhone: '778654321',
        recipientAddress: 'Dakar Almadies, villa verte porte 12',
        amount: 7000,
        paymentStatus: 'PAID',
        paymentMethod: 'WAVE',
        paidAt: new Date(),
        notes: 'Fragile, manipuler avec soin svp',
      },
    })

    await db.package.create({
      data: {
        tripId: trip5.id,
        senderId: passenger1.id,
        status: 'DELIVERED',
        description: 'Documents administratifs',
        weight: 0.5,
        size: 'S',
        senderName: 'Fatou Diallo',
        senderPhone: '781234567',
        recipientName: 'Ousmane Camara',
        recipientPhone: '761234567',
        recipientAddress: 'Dakar Médina, marché Sandaga',
        amount: 1000,
        paymentStatus: 'CONFIRMED_BY_DRIVER',
        paymentMethod: 'WAVE',
        paidAt: new Date(),
      },
    })

    // Package notifications
    await db.notification.create({
      data: {
        userId: passenger1.id,
        type: 'RESERVATION_CONFIRMED',
        title: '📦 Colis en transit',
        message: 'Votre colis "Sac de vêtements" est en transit vers Dakar.',
        data: JSON.stringify({ tripId: trip1.id }),
        read: false,
      },
    })

    await db.notification.create({
      data: {
        userId: driver1.id,
        type: 'NEW_RESERVATION',
        title: '📦 Nouveau colis en attente',
        message: 'Aminata Ba souhaite envoyer un colis (Carton cosmétiques, 10kg) sur votre trajet Thiènaba → Dakar.',
        data: JSON.stringify({ tripId: trip3.id }),
        read: false,
      },
    })

    return NextResponse.json({
      message: 'Données de test créées avec succès',
      stats: {
        drivers: 4,
        passengers: 2,
        trips: 6,
        reservations: 3,
        notifications: 8,
        ratings: 5,
        tripShares: 1,
        packages: 3,
        admins: 1,
      },
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création des données de test' },
      { status: 500 }
    )
  }
}
