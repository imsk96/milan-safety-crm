import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabaseClient'
import { api } from '../services/api'
import { User, Palette, Building2, Moon, Sun, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { backgroundImage, updateBackground, darkMode, toggleDarkMode } = useAppStore()
  const { profile, setProfile } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    tag_name: '',
    login_id: '',
  })

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        tag_name: profile.tag_name || '',
        login_id: profile.login_id || '',
      })
    }
  }, [profile])

  const handleProfileSave = async () => {
    if (!profile?.id) return
    setSavingProfile(true)
    try {
      const updated = await api.update('users', profile.id, {
        name: profileForm.name,
        tag_name: profileForm.tag_name,
        login_id: profileForm.login_id,
      })
      setProfile({ ...profile, ...updated })
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Failed to update profile: ' + error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // File size check - 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB allowed.')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `background-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName)

      await updateBackground(publicUrl)
      toast.success('Background updated successfully')
    } catch (error) {
      toast.error('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveBackground = async () => {
    try {
      await updateBackground(null)
      toast.success('Background removed')
    } catch (error) {
      toast.error('Failed to remove background')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <User size={20} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 opacity-70">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Your full name"
              className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 opacity-70">Login ID</label>
            <input
              type="text"
              value={profileForm.login_id}
              onChange={(e) => setProfileForm({ ...profileForm, login_id: e.target.value })}
              placeholder="your.login.id"
              className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 opacity-70">Tag Name</label>
            <input
              type="text"
              value={profileForm.tag_name}
              onChange={(e) => setProfileForm({ ...profileForm, tag_name: e.target.value })}
              placeholder="@your_tag"
              className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 opacity-70">Role</label>
            <input
              type="text"
              value={profile?.role || ''}
              disabled
              className="w-full p-3 glass bg-white/5 rounded-lg opacity-50 cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleProfileSave}
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </GlassCard>

      {/* Appearance Settings */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Palette size={20} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold">Appearance</h2>
        </div>

        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm opacity-60">Toggle between light and dark theme</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode ? 'bg-blue-600 text-white' : 'glass bg-white/10'
              }`}
            >
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              {darkMode ? 'Dark' : 'Light'}
            </button>
          </div>

          {/* Background Image */}
          <div>
            <p className="font-medium mb-1">Background Image</p>
            <p className="text-sm opacity-60 mb-3">Upload a custom background for your dashboard</p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
              />
              {uploading && (
                <span className="text-sm text-blue-400 whitespace-nowrap">Uploading...</span>
              )}
            </div>

            {backgroundImage && (
              <div className="mt-4 space-y-3">
                <p className="text-sm opacity-60">Current background:</p>
                <div className="relative inline-block">
                  <img
                    src={backgroundImage}
                    alt="Current background"
                    className="h-24 rounded-lg object-cover"
                  />
                </div>
                <div>
                  <button
                    onClick={handleRemoveBackground}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove background
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Company Info (read-only) */}
      {profile?.role === 'admin' && (
        <GlassCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Building2 size={20} className="text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">Company</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1 opacity-70">Company ID</label>
              <input
                type="text"
                value={profile?.company_id || ''}
                disabled
                className="w-full p-3 glass bg-white/5 rounded-lg opacity-50 cursor-not-allowed text-sm font-mono"
              />
            </div>
            <p className="text-xs opacity-40">
              Share this Company ID with your team members during signup.
            </p>
          </div>
        </GlassCard>
      )}
    </div>
  )
}