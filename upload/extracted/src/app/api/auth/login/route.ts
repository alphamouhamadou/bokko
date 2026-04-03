import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Téléphone et mot de passe requis' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { phone } })
    if (!user) {
      return NextResponse.json(
        { error: 'Compte introuvable', needsRegistration: true },
        { status: 404 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    const { password: _, ...userWithoutPassword } = user

    let vehicleData: any = null
    if (user.role === 'DRIVER') {
      vehicleData = await db.vehicle.findUnique({ where: { driverId: user.id } })
    }

    return NextResponse.json({
      user: userWithoutPassword,
      vehicle: vehicleData,
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
