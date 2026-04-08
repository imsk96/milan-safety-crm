import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { useAppStore } from '../store/appStore'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function Settings() {
  const { backgroundImage, updateBackground } = useAppStore()
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `background-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName)

      await updateBackground(publicUrl)
      toast.success('Background updated')
    } catch (error) {
      toast.error('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div>
          <label className="block text-sm mb-2">Background Image</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {uploading && <span className="text-sm">Uploading...</span>}
          </div>
          {backgroundImage && (
            <div className="mt-4">
              <p className="text-sm mb-2">Current background:</p>
              <img src={backgroundImage} alt="Background" className="h-20 rounded-lg" />
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}