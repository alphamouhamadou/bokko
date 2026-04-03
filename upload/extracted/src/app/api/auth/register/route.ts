import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, name, role, password, licenseNumber, licenseExpiry, waveBusinessLink, vehicle } = body

    if (!phone || !name || !role) {
      return NextResponse.json(
        { error: 'Téléphone, nom et rôle sont requis' },
        { status: 400 }
      )
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({ where: { phone } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hash the user's password if provided, otherwise generate a random one
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)

    const user = await db.user.create({
      data: {
        phone,
        password: hashedPassword,
        name,
        role: role.toUpperCase(),
        licenseNumber: licenseNumber || null,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        waveBusinessLink: waveBusinessLink || null,
      },
    })

    if (role.toUpperCase() === 'DRIVER' && vehicle) {
      await db.vehicle.create({
        data: {
          brand: vehicle.brand,
          model: vehicle.model || '',
          color: vehicle.color,
          plateNumber: vehicle.plateNumber || '',
          capacity: parseInt(vehicle.capacity),
          driverId: user.id,
        },
      })
    }

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
