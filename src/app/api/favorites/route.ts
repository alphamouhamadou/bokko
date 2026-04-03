import { NextRequest, NextResponse } from 'next/server'

// In-memory favorites store (no FavoriteDriver model in schema)
const favoritesMap = new Map<string, Set<string>>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ favorites: [] })
  }

  const userFavorites = favoritesMap.get(userId)
  const favorites = userFavorites
    ? Array.from(userFavorites).map((driverId) => ({ driverId, savedAt: new Date().toISOString() }))
    : []

  return NextResponse.json({ favorites })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, driverId } = await request.json()

    if (!userId || !driverId) {
      return NextResponse.json({ error: 'userId et driverId requis' }, { status: 400 })
    }

    if (!favoritesMap.has(userId)) {
      favoritesMap.set(userId, new Set())
    }

    favoritesMap.get(userId)!.add(driverId)

    return NextResponse.json({ success: true, message: 'Chauffeur ajouté aux favoris' })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const driverId = searchParams.get('driverId')

  if (!userId || !driverId) {
    return NextResponse.json({ error: 'userId et driverId requis' }, { status: 400 })
  }

  const userFavorites = favoritesMap.get(userId)
  if (userFavorites) {
    userFavorites.delete(driverId)
  }

  return NextResponse.json({ success: true, message: 'Chauffeur retiré des favoris' })
}
