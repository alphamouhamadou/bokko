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

    

    // Create admin user
    const adminPassword = await bcrypt.hash('Thienaba10@', 10)
    await db.user.create({
      data: {
        phone: '776211339',
        password: adminPassword,
        name: 'Admin BOKKO',
        role: 'ADMIN',
      },
    })

  

    return NextResponse.json({
      message: 'Données de test créées avec succès',
      stats: {
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
