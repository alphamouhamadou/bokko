'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CheckCircle, Loader2 } from 'lucide-react'

const REASONS = [
  "Comportement inapproprié",
  "Annulation répétée",
  "Paiement non confirmé",
  "Harcèlement",
  "Autre",
]

interface ReportUserProps {
  open: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
}

export default function ReportUser({ open, onClose, reportedUserId, reportedUserName }: ReportUserProps) {
  const user = useAppStore((s) => s.user)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Veuillez choisir une raison')
      return
    }
    if (!user?.id) {
      toast.error('Vous devez être connecté')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          reportedId: reportedUserId,
          reason,
          description: description.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors du signalement')
        return
      }
      setSubmitted(true)
      toast.success('Signalement envoyé avec succès')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setReason('')
      setDescription('')
      setSubmitted(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#006233]/10 dark:bg-[#006233]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#006233]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Signalement envoyé</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Merci pour votre signalement. Notre équipe examinera votre demande.
            </p>
            <Button
              onClick={handleClose}
              className="w-full min-h-[48px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold"
            >
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-5 pb-0">
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-xl">⚑</span>
                Signaler {reportedUserName}
              </DialogTitle>
            </DialogHeader>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pourquoi signalez-vous cet utilisateur ?
              </p>

              {/* Reason buttons */}
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      reason === r
                        ? 'bg-[#006233] text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#006233]/50 dark:hover:border-green-500/50'
                    }`}
                  >
                    {reason === r && '✓ '}{r}
                  </button>
                ))}
              </div>

              {/* Description */}
              <div>
                <Textarea
                  placeholder="Description facultative (max 500 caractères)..."
                  value={description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setDescription(e.target.value)
                    }
                  }}
                  className="min-h-[80px] rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-[#006233] dark:focus:border-green-500 text-sm resize-none"
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                  {description.length}/500
                </p>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="w-full min-h-[48px] rounded-2xl bg-[#CE1126] hover:bg-[#CE1126]/90 text-white font-semibold gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '⚑ Envoyer le signalement'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
