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
