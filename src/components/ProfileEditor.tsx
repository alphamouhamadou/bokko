'use client'

import { useState } from 'react'
import { Camera, Save, Loader2, ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function ProfileEditor() {
  const { user, setUser, setView } = useAppStore()
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.photoUrl || null)
  const [bio, setBio] = useState(user?.bio || '')
  const [experience, setExperience] = useState(String(user?.experience || ''))
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2 Mo')
      return
    }

    setUploadingPhoto(true)
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(reader.result as string)
      setUploadingPhoto(false)
    }
    reader.onerror = () => {
      toast.error('Erreur lors du chargement de l\'image')
      setUploadingPhoto(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const res = await fetch('/api/drivers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: user.id,
          photoUrl: photoUrl || null,
          bio: bio || null,
          experience: experience || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setUser({
        ...user,
        photoUrl: data.driver.photoUrl,
        bio: data.driver.bio,
        experience: data.driver.experience,
      } as any)
      toast.success('Profil mis à jour avec succès !')
      setView('driver-profile')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Modifier mon profil</h2>
        <p className="text-sm text-gray-500">Personnalisez votre profil chauffeur</p>
      </div>

      {/* Photo Upload */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Photo de profil</h4>
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Photo de profil"
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#006233]/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#006233]/10 flex items-center justify-center border-2 border-dashed border-[#006233]/30">
                  <Camera className="w-6 h-6 text-[#006233]/40" />
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#006233] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#006233]/90">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {uploadingPhoto ? 'Chargement...' : 'Ajouter une photo'}
              </p>
              <p className="text-xs text-gray-400">JPG, PNG — Max 2 Mo</p>
              {photoUrl && (
                <button
                  onClick={() => setPhotoUrl(null)}
                  className="text-xs text-[#CE1126] mt-1 hover:underline"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Biographie</h4>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Parlez de votre expérience, votre véhicule, vos habitudes de conduite..."
            className="min-h-[100px] resize-none rounded-xl border-gray-200 focus:border-[#006233]"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Expérience</h4>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="0"
              min="0"
              max="50"
              className="w-24 h-12 text-center rounded-xl border-gray-200 focus:border-[#006233] text-lg font-bold"
            />
            <span className="text-sm text-gray-500">années d&apos;expérience</span>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Aperçu</h4>
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Aperçu"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#006233]/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#006233]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#006233]">
                  {user?.name?.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold">{user?.name}</p>
              {bio && <p className="text-xs text-gray-500 line-clamp-1">{bio}</p>}
              {experience && <p className="text-xs text-gray-400">{experience} ans d&apos;expérience</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex gap-3 pb-4">
        <Button
          variant="outline"
          onClick={() => setView('driver-profile')}
          className="flex-1 h-12 rounded-2xl border-gray-200"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-12 rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold shadow-lg"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>
    </div>
  )
}
