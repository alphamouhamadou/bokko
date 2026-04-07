'use client'

import { useState } from 'react'
import { Shield, Phone, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function AdminLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setView = useAppStore((s) => s.setView)

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      toast.error('Entrez un numéro de téléphone valide (9 chiffres)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur de connexion')
        return
      }
      if (data.user.role !== 'ADMIN') {
        toast.error('Accès non autorisé')
        return
      }
      toast.success(`Bienvenue ${data.user.name} !`)
      setView('admin-dashboard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6 bg-gradient-to-b from-[#006233] to-[#004d28]">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Shield className="w-10 h-10 text-[#FFD700]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Administration BOKKO</h2>
          <p className="text-sm text-white/70 mt-1">Connexion administrateur</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="77 000 00 00"
              className="pl-12 h-16 rounded-2xl text-2xl text-center font-semibold tracking-wider border-2 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full min-h-[56px] rounded-2xl bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#006233] font-bold text-lg shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'SE CONNECTER'
            )}
          </Button>
        </form>

        
      </div>
    </div>
  )
}
