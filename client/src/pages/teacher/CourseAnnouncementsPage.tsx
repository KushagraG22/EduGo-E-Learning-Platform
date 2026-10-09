import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Megaphone, Plus, Trash2, Edit, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Announcement, Course } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const CourseAnnouncementsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const [courseRes, annRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/announcements`),
      ]);
      if (courseRes.data?.success) setCourse(courseRes.data.course);
      if (annRes.data?.success) setAnnouncements(annRes.data.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/courses/${courseId}/announcements/${editingId}`, {
          title: title.trim(),
          message: message.trim(),
        });
      } else {
        await api.post(`/courses/${courseId}/announcements`, {
          title: title.trim(),
          message: message.trim(),
        });
      }
      setModalOpen(false);
      setTitle('');
      setMessage('');
      setEditingId(null);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${courseId}/announcements/${announcementToDelete._id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== announcementToDelete._id));
      setAnnouncementToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </Link>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Course Broadcasts
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {course?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Announcements notify all enrolled students inside their notification feed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTitle('');
              setMessage('');
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-2">
            <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No announcements posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Broadcast course updates, downloadable resource notifications, or welcome messages to all your students.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                    <span className="text-[11px] text-slate-400">
                      Posted on {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(ann._id);
                        setTitle(ann.title);
                        setMessage(ann.message);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnouncementToDelete(ann)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {ann.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Announcement Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Announcement' : 'Post Announcement'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Announcement Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Welcome to Module 2 & New Resources"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Write your announcement message to all enrolled students..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 bg-slate-50 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl shadow-sm disabled:opacity-50"
              >
                {saving ? 'Posting...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirm */}
        <ConfirmModal
          isOpen={!!announcementToDelete}
          onClose={() => setAnnouncementToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Announcement"
          message={`Are you sure you want to delete the announcement "${announcementToDelete?.title}"?`}
          confirmText="Delete"
          isDangerous
          isLoading={deleting}
        />
      </div>
    </div>
  );
};
