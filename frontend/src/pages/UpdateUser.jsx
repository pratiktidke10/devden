
// Lets the logged-in user update their name, bio and avatar.
// Uses FormData instead of JSON because we're uploading a file (avatar image).
// This is an important difference from other forms.

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api/auth'
import { updateUserProfile } from '../api/users'
import Avatar from '../components/Avatar'

function UpdateUser() {
  const navigate = useNavigate()
  const currentUserId = localStorage.getItem('user_id')

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load current user data to pre-fill the form
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getMe()
        setFormData({
          name: res.data.name || '',
          username: res.data.username || '',
          bio: res.data.bio || '',
        })
        setAvatarPreview(res.data.avatar)
      } catch (err) {
        setError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // When user picks an image file:
  // 1. Store the File object for upload
  // 2. Create a local preview URL using URL.createObjectURL
  //    This shows the image instantly without uploading yet
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // FormData is used instead of JSON when uploading files.
    // JSON cannot encode binary file data — FormData can.
    // The backend expects multipart/form-data for file uploads.
    const data = new FormData()
    data.append('name', formData.name)
    data.append('username', formData.username.toLowerCase())
    data.append('bio', formData.bio)
    if (avatarFile) data.append('avatar', avatarFile)

    try {
      await updateUserProfile(currentUserId, data)
      navigate(`/profile/${currentUserId}`)
    } catch (err) {
      const errData = err.response?.data
      if (errData) {
        const first = Object.values(errData)[0]
        setError(Array.isArray(first) ? first[0] : first)
      } else {
        setError('Could not update profile.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="h-64 bg-den-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-8">

      <h1 className="font-mono text-base font-bold text-den-text mb-6">
        Edit Profile
      </h1>

      <div className="bg-den-surface border border-den-border rounded-xl p-6">

        {error && (
          <div className="bg-[#2d1b1b] border border-den-red text-den-red text-sm font-mono p-3 rounded-lg mb-4">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar
              initials={formData.name?.slice(0, 2).toUpperCase()}
              imageUrl={avatarPreview}
              size="xl"
            />
            <div>
              <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-den-muted text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-den-border2 file:text-den-muted file:bg-den-bg file:font-mono file:text-xs hover:file:text-den-text cursor-pointer"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text outline-none focus:border-den-blue transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text outline-none focus:border-den-blue transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-mono text-xs text-den-faint uppercase tracking-wider mb-1.5">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell the community about yourself..."
              className="w-full bg-den-bg border border-den-border2 rounded-lg px-3 py-2.5 text-sm text-den-text placeholder-den-faint outline-none focus:border-den-blue transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#238636] hover:opacity-90 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-opacity"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 text-sm font-medium text-den-muted border border-den-border2 rounded-lg hover:text-den-text hover:border-den-blue transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default UpdateUser