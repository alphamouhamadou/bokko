import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Retrieve user's saved home location from localStorage equivalent (stored as notification data for now)
    // We use the User model to store home lat/lon via JSON in a dedicated approach
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, phone: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }
    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Get passenger location error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { address, lat, lon, type } = body // type: 'home' | 'current'

    if (!address || lat === undefined || lon === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Save location as a notification-type marker so it persists
    // We create/update a special "location" type notification for this user
    const locType = type === 'home' ? 'HOME_LOCATION' : 'CURRENT_LOCATION'

    // Delete existing location marker of same type
    await db.notification.deleteMany({
      where: { userId: id, type: locType },
    })

    // Create new location marker
    await db.notification.create({
      data: {
        userId: id,
        type: locType,
        title: type === 'home' ? '📍 Domicile' : '📍 Position actuelle',
        message: address,
        data: JSON.stringify({ address, lat, lon, updatedAt: new Date().toISOString() }),
        read: true,
      },
    })

    return NextResponse.json({ success: true, address, lat, lon })
  } catch (error: any) {
    console.error('Save passenger location error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
