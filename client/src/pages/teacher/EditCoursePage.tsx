import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Layers, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Course, CourseStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const EditCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [status, setStatus] = useState<CourseStatus>('draft');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    'Web Development',
    'Data Science',
    'Design',
    'DevOps & Cloud',
    'Mobile Development',
    'Computer Science',
    'Artificial Intelligence',
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.data?.success && res.data?.course) {
          const c: Course = res.data.course;
          setCourse(c);
          setTitle(c.title);
          setSummary(c.summary);
          setDescription(c.description);
          setCategory(c.category);
          setDifficulty(c.difficulty);
          setEstimatedDuration(c.estimatedDuration || '');
          setThumbnail(c.thumbnail || '');
          setLearningObjectives(c.learningObjectives?.length ? c.learningObjectives : ['']);
          setPrerequisites(c.prerequisites?.length ? c.prerequisites : ['']);
          setStatus(c.status);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'thumbnails');

    setUploadingImage(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.file?.url) {
        setThumbnail(res.data.file.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/courses/${courseId}/publish`);
      if (res.data?.success) {
        setStatus(res.data.status);
        setSuccess(`Course is now ${res.data.status}!`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not change publication status');
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteCourse = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await api.delete(`/courses/${courseId}`);
      if (res.data?.success) {
        navigate('/teacher/courses');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete course');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSaving(true);
    try {
      const res = await api.put(`/courses/${courseId}`, {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        category,
        difficulty,
        estimatedDuration: estimatedDuration.trim(),
        thumbnail: thumbnail.trim(),
        learningObjectives: learningObjectives.filter((o) => o.trim().length > 0),
        prerequisites: prerequisites.filter((p) => p.trim().length > 0),
      });

      if (res.data?.success) {
        setSuccess('Course updated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
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
        <div className="flex items-center justify-between">
          <Link
            to="/teacher/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Courses
          </Link>

          <Link
            to={`/teacher/courses/${courseId}/curriculum`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 transition-colors"
          >
            <Layers className="w-4 h-4" />
            Manage Curriculum &amp; Lessons
          </Link>
        </div>

        {/* Header with Publish Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="status" status={status} />
              <Badge variant="category">{category}</Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Course Details</h1>
          </div>

          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 ${
              status === 'published'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {publishing
              ? 'Updating...'
              : status === 'published'
              ? 'Unpublish Course (Set to Draft)'
              : 'Publish Course to Public Catalog'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Duration</label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Short Summary</label>
            <textarea
              required
              rows={2}
              maxLength={300}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Description</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Thumbnail</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="flex-1 w-full px-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
              <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 flex-shrink-0">
                <Upload className="w-4 h-4" />
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-rose-50/60 rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-rose-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Danger Zone: Delete Course
              </h3>
              <p className="text-xs text-rose-700 mt-1 max-w-xl">
                Archiving this course will permanently remove it from public catalog discovery and block new enrollments.
                Existing student certificates and learning progress remain safely preserved.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Delete Course
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteCourse}
          title={`Delete Course: "${title}"`}
          message={`Are you sure you want to delete this course?

• Removal from Public Discovery: This course will be immediately archived and permanently removed from catalog discovery and search.
• New Enrollments Blocked: No new students will be allowed to enroll.
• Student Records Protected: Enrolled students will retain access to their existing certificates, verification IDs, and completed learning history.

This action cannot be undone.`}
          confirmText={deleting ? 'Deleting Course...' : 'Delete Course'}
          cancelText="Cancel"
          isDangerous
          isLoading={deleting}
        />
      </div>
    </div>
  );
};
