'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function RatingForm() {
  const { user, selectedDriver, ratingTripId, setView } = useAppStore()
  const [score, setScore] = useState(0)
  const [hoverScore, setHoverScore] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!user?.id || !selectedDriver?.id) return
    if (score === 0) {
      toast.error('Veuillez sélectionner une note')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserId: selectedDriver.id,
          tripId: ratingTripId || '',
          score,
          comment: comment || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setSuccess(true)
      toast.success('Merci pour votre avis !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex-1 px-4 py-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#006233]/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#006233]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Merci pour votre avis !</h3>
            <p className="text-sm text-gray-500">
              Votre note a été enregistrée et aide la communauté BOKKO.
            </p>
            <Button
              onClick={() => setView('driver-profile')}
              className="mt-4 bg-[#006233] hover:bg-[#006233]/90 text-white rounded-2xl"
            >
              Retour au profil
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const labels = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent']

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Noter le chauffeur</h2>
        <p className="text-sm text-gray-500">
          {selectedDriver?.name || 'Chauffeur'}
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Driver info */}
          <div className="flex items-center gap-3">
            {selectedDriver?.photoUrl ? (
              <img
                src={selectedDriver.photoUrl}
                alt={selectedDriver.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#006233]/10 flex items-center justify-center">
                <span className="text-lg font-bold text-[#006233]">
                  {selectedDriver?.name?.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold">{selectedDriver?.name}</p>
              <p className="text-xs text-gray-400">Chauffeur BOKKO</p>
            </div>
          </div>

          {/* Star rating */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoverScore(i)}
                  onMouseLeave={() => setHoverScore(0)}
                  onClick={() => setScore(i)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      i <= (hoverScore || score)
                        ? 'text-[#FFD700] fill-[#FFD700]'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            {score > 0 && (
              <p className="text-sm font-medium text-[#006233]">
                {labels[score]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Laissez un commentaire (optionnel)..."
              className="min-h-[80px] resize-none rounded-xl border-gray-200 focus:border-[#006233]"
              maxLength={300}
            />
            <p className="text-xs text-gray-400 text-right">{comment.length}/300</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || score === 0}
            className="w-full h-12 rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold shadow-lg"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Envoyer mon avis
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
