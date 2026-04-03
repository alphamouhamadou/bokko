'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2, Trash2, Lock } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function DeleteAccount() {
  const [showDialog, setShowDialog] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)

  const handleDelete = async () => {
    if (!password) {
      toast.error('Veuillez entrer votre mot de passe')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la suppression')
        return
      }
      toast.success('Compte supprimé avec succès')
      setShowDialog(false)
      setPassword('')
      // Logout and redirect to home
      setTimeout(() => {
        logout()
      }, 1000)
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Supprimer mon compte</h3>
            <p className="text-xs text-gray-500">Cette action est irréversible</p>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-700">Attention</p>
                <p className="text-xs text-red-600">
                  La suppression de votre compte est définitive. Toutes vos données, réservations et trajets seront supprimés.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => setShowDialog(true)}
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          SUPPRIMER MON COMPTE
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Veuillez entrer votre mot de passe pour confirmer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  className="pl-10 h-12 rounded-xl text-sm border-2 border-gray-200 focus:border-red-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleDelete}
              disabled={loading || !password}
              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SUPPRIMER DÉFINITIVEMENT'}
            </Button>
            <Button
              onClick={() => { setShowDialog(false); setPassword('') }}
              variant="outline"
              className="w-full h-10 rounded-xl"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
