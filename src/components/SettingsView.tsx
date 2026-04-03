'use client'

import { useState } from 'react'
import { User, Phone, Lock, Loader2, Eye, EyeOff, Shield } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function SettingsView() {
  const { user, goBack } = useAppStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Entrez votre mot de passe actuel')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (currentPassword === newPassword) {
      toast.error('Le nouveau mot de passe doit être différent de l\'actuel')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success('Mot de passe modifié avec succès !')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      {/* User Info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#006233]/10 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-[#006233]" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">{user.phone}</span>
              </div>
              <span className="inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-[#006233]/10 text-[#006233]">
                {user.role === 'DRIVER' ? 'Chauffeur' : 'Passager'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#006233]" />
            <h4 className="font-semibold text-gray-900">Changer le mot de passe</h4>
          </div>

          {/* Current password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Mot de passe actuel"
              className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* New password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Nouveau mot de passe"
              className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm new password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmer le nouveau mot de passe"
              className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'MODIFIER'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
