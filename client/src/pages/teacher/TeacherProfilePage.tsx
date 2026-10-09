import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Eye, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TeacherProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'avatars');

    setUploading(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.file?.url) {
        setAvatar(res.data.file.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Teacher Profile &amp; Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your public teacher biography and headline appear on course detail pages.
            </p>
          </div>

          {user?.id && (
            <Link
              to={`/teachers/${user.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-brand-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm self-start sm:self-auto"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </Link>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
          {/* Avatar Preview & Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Profile Photo</label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-100 flex-shrink-0 border border-slate-200 shadow-sm">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-extrabold text-2xl text-brand-700">
                    {name?.charAt(0) || 'T'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Uploading...' : 'Upload New Avatar'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  placeholder="or paste image URL"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Headline (e.g. Senior Software Architect &bull; Author)
            </label>
            <input
              type="text"
              maxLength={120}
              placeholder="A brief tagline describing your professional background..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
            <span className="text-[10px] text-slate-400 block text-right mt-1">{headline.length}/120</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Instructor Biography
            </label>
            <textarea
              rows={5}
              maxLength={1000}
              placeholder="Tell prospective students about your industry experience and teaching style..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-4 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block text-right mt-1">{bio.length}/1000</span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
