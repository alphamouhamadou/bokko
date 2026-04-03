'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, Package, Hash, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

export default function PackageConfirmation() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('id')

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [packageInfo, setPackageInfo] = useState<any>(null)

  const handleConfirm = async () => {
    if (code.length !== 6) {
      setError('Entrez un code à 6 chiffres')
      return
    }
    if (!packageId) {
      toast.error('Colis non trouvé')
      return
    }
    setLoading(true)
    setError('')

    try {
      // First fetch package info
      const infoRes = await fetch(`/api/packages/${packageId}`)
      const infoData = await infoRes.json()

      if (!infoRes.ok) {
        setError('Colis non trouvé')
        setLoading(false)
        return
      }

      setPackageInfo(infoData.package)

      // Then confirm
      const res = await fetch(`/api/packages/${packageId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationCode: code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur')
        setLoading(false)
        return
      }

      setConfirmed(true)
      toast.success('✅ Livraison confirmée avec succès !')
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (!packageId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Colis non trouvé</h2>
            <p className="text-sm text-gray-500 mt-2">
              Le lien de confirmation est invalide
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {/* BOKKO Header */}
        <div className="text-center mb-2">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-black text-[#006233]">BOKKO</h1>
          </Link>
          <p className="text-sm text-gray-500">Confirmation de livraison</p>
        </div>

        {!confirmed ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#006233]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-[#006233]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Confirmez la réception</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Entrez le code à 6 chiffres donné par le chauffeur
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Hash className="w-3 h-3" />
                  <span>Code de confirmation</span>
                </div>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  className="h-16 rounded-2xl text-2xl text-center font-mono tracking-[0.3em] font-bold"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setCode(val)
                    setError('')
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs text-red-600 text-center font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleConfirm}
                disabled={loading || code.length !== 6}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#006233] to-[#008040] hover:from-[#005528] hover:to-[#006a30] text-white font-bold text-base gap-2 shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                CONFIRMER LA LIVRAISON
              </Button>

              <p className="text-[10px] text-center text-gray-400">
                Ce code vous a été communiqué par le chauffeur qui a livré votre colis
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#006233] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Livraison confirmée !</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Le colis a été remis avec succès
                </p>
              </div>

              {packageInfo && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Colis</span>
                    <span className="font-medium">{packageInfo.description}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Trajet</span>
                    <span className="font-medium">{packageInfo.trip?.origin} → {packageInfo.trip?.destination}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Destinataire</span>
                    <span className="font-medium">{packageInfo.recipientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Confirmé le</span>
                    <span className="font-medium">
                      {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-[#006233]/5 border border-[#006233]/20 rounded-xl p-4 text-center">
                <p className="text-sm text-[#006233] font-medium">
                  ✅ Le chauffeur et l&apos;expéditeur ont été notifiés
                </p>
              </div>

              <Link href="/" className="block">
                <Button className="w-full h-12 rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold text-sm">
                  Retour à l&apos;accueil
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-[10px] text-gray-400">
          © 2026 BOKKO — Covoiturage & Livraison Sénégal
        </p>
      </div>
    </div>
  )
}
