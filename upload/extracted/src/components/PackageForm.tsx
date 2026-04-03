'use client'

import { useState } from 'react'
import { Package, MapPin, Phone, Loader2, Send, StickyNote } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const SIZE_OPTIONS = [
  { key: 'S', label: 'Petit', desc: 'Sac, petit carton' },
  { key: 'M', label: 'Moyen', desc: 'Carton moyen' },
  { key: 'L', label: 'Grand', desc: 'Grand carton, valise' },
  { key: 'XL', label: 'Très grand', desc: 'Plusieurs cartons' },
]

export default function PackageForm() {
  const { user, selectedTrip, setView } = useAppStore()
  const [description, setDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [size, setSize] = useState('M')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const trip = selectedTrip

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error('Décrivez le contenu du colis')
      return
    }
    if (!recipientName || !recipientPhone || !recipientAddress) {
      toast.error('Remplissez les infos du destinataire')
      return
    }
    if (!trip?.id) {
      toast.error('Trajet non sélectionné')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          senderId: user?.id,
          senderName: user?.name || '',
          senderPhone: user?.phone || '',
          description: description.trim(),
          weight: parseFloat(weight) || 1,
          size,
          recipientName,
          recipientPhone,
          recipientAddress,
          amount: estimatedPrice,
          notes: notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'envoi du colis")
        return
      }
      toast.success('📦 Colis enregistré ! Le chauffeur viendra le récupérer.')
      setView('passenger-packages')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const estimatedPrice = (parseFloat(weight) || 1) * (trip?.packagePricePerKg || 0)

  if (!trip) {
    return (
      <div className="flex-1 px-4 py-4 text-center">
        <p className="text-gray-500">Trajet non sélectionné</p>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#FFD700]" />
          Envoyer un colis
        </h2>
        <p className="text-sm text-gray-500">Faites livrer un colis avec ce chauffeur</p>
      </div>

      {/* Trip Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-[#006233] to-[#008040]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs text-white/60">Trajet</p>
              <p className="text-sm font-semibold">{trip.origin} → {trip.destination}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Prix</p>
              <p className="text-sm font-bold">{(trip.packagePricePerKg || 0).toLocaleString()} FCFA/kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Package Details */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📦</span>
              <span className="text-sm font-bold text-gray-900">Description du colis</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Contenu du colis *</Label>
              <Textarea
                placeholder="Ex: Vêtements, documents, produits alimentaires..."
                className="rounded-2xl min-h-[60px] text-base"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-gray-400 text-right">{description.length}/200</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Poids estimé (kg)</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="1"
                min="0.1"
                max="100"
                step="0.1"
                className="h-14 rounded-2xl text-base"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Taille</Label>
              <div className="grid grid-cols-2 gap-2">
                {SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSize(opt.key)}
                    className={`text-left p-3 rounded-2xl border-2 transition-all min-h-[56px] ${
                      size === opt.key
                        ? 'border-[#006233] bg-[#006233]/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className={`text-sm font-bold ${size === opt.key ? 'text-[#006233]' : 'text-gray-700'}`}>
                      {size === opt.key && '✓ '}{opt.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Price */}
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">💰 Prix estimé</span>
              <span className="text-base font-bold text-[#006233]">{estimatedPrice.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Info */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📍</span>
              <span className="text-sm font-bold text-gray-900">Destinataire</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Nom du destinataire *</Label>
              <Input
                placeholder="Nom complet"
                className="h-14 rounded-2xl text-base"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Téléphone du destinataire *</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="77 123 45 67"
                  className="h-14 rounded-2xl pl-12 text-lg"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-500">Adresse de livraison *</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <Textarea
                  placeholder="Ex: Dakar Plateau, près de la place..."
                  className="rounded-2xl min-h-[60px] pl-12 text-base"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Notes (optionnel)</span>
            </div>
            <Textarea
              placeholder="Fragile, appel avant livraison..."
              className="rounded-2xl min-h-[50px] text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={loading}
          className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFB300] text-[#006233] font-bold text-lg shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          ENVOYER LE COLIS
        </Button>
        <p className="text-xs text-center text-gray-400">
          💰 Prix : {(trip.packagePricePerKg || 0).toLocaleString()} FCFA/kg × {parseFloat(weight) || 1}kg = {estimatedPrice.toLocaleString()} FCFA — Paiement à la livraison
        </p>
      </form>
    </div>
  )
}
