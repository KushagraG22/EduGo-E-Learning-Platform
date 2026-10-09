import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  PlayCircle,
  FileText,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  FolderPlus,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Section, Lesson, LessonType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const CurriculumBuilderPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Section Modal
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');

  // Lesson Modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('video');
  const [lessonRequired, setLessonRequired] = useState(true);
  const [lessonDuration, setLessonDuration] = useState<number>(10);
  const [videoUrl, setVideoUrl] = useState('');
  const [textHtml, setTextHtml] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');

  // Uploading state
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Confirm delete modals
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'section' | 'lesson';
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCurriculum = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/curriculum`);
      if (res.data?.success) {
        setCourse(res.data.course);
        setSections(res.data.curriculum || []);
      }
    } catch (err) {
      console.error('Failed to fetch curriculum', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [courseId]);

  // Handle Section Create/Update
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    try {
      if (editingSectionId) {
        await api.put(`/courses/${courseId}/sections/${editingSectionId}`, {
          title: sectionTitle.trim(),
        });
      } else {
        await api.post(`/courses/${courseId}/sections`, {
          title: sectionTitle.trim(),
        });
      }
      setSectionModalOpen(false);
      setSectionTitle('');
      setEditingSectionId(null);
      fetchCurriculum();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save section');
    }
  };

  // Open Lesson Modal for New or Edit
  const openNewLessonModal = (secId: string) => {
    setActiveSectionId(secId);
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonDescription('');
    setLessonType('video');
    setLessonRequired(true);
    setLessonDuration(10);
    setVideoUrl('');
    setTextHtml('');
    setFileUrl('');
    setFileName('');
    setLessonModalOpen(true);
  };

  const openEditLessonModal = (secId: string, les: Lesson) => {
    setActiveSectionId(secId);
    setEditingLessonId(les._id);
    setLessonTitle(les.title);
    setLessonDescription(les.description || '');
    setLessonType(les.type);
    setLessonRequired(les.isRequired);
    setLessonDuration(les.duration || 10);
    setVideoUrl(les.content?.videoUrl || '');
    setTextHtml(les.content?.textHtml || '');
    setFileUrl(les.content?.fileUrl || '');
    setFileName(les.content?.fileName || '');
    setLessonModalOpen(true);
  };

  // Upload handler for lesson media or files
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', lessonType === 'video' ? 'videos' : 'resources');

    setUploadingMedia(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.file?.url) {
        if (lessonType === 'video') {
          setVideoUrl(res.data.file.url);
        } else if (lessonType === 'file') {
          setFileUrl(res.data.file.url);
          setFileName(res.data.file.originalName || file.name);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Handle Lesson Save
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const content: any = {};
    if (lessonType === 'video') content.videoUrl = videoUrl.trim();
    if (lessonType === 'text') content.textHtml = textHtml;
    if (lessonType === 'file') {
      content.fileUrl = fileUrl.trim();
      content.fileName = fileName.trim() || 'course-resource.pdf';
    }

    try {
      if (editingLessonId) {
        await api.put(`/courses/${courseId}/lessons/${editingLessonId}`, {
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          type: lessonType,
          isRequired: lessonRequired,
          duration: Number(lessonDuration) || 0,
          content,
        });
      } else {
        await api.post(`/courses/${courseId}/sections/${activeSectionId}/lessons`, {
          title: lessonTitle.trim(),
          description: lessonDescription.trim(),
          type: lessonType,
          isRequired: lessonRequired,
          duration: Number(lessonDuration) || 0,
          content,
        });
      }

      setLessonModalOpen(false);
      fetchCurriculum();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save lesson');
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);

    try {
      if (itemToDelete.type === 'section') {
        await api.delete(`/courses/${courseId}/sections/${itemToDelete.id}`);
      } else {
        await api.delete(`/courses/${courseId}/lessons/${itemToDelete.id}`);
      }
      setItemToDelete(null);
      fetchCurriculum();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete item');
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/teacher/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Courses
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to={`/teacher/courses/${courseId}/edit`}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Edit Course Details
            </Link>
            <Link
              to={`/courses/${course?.slug || courseId}`}
              className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Course
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
              Curriculum Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {course?.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organize sections and lessons. Required lessons contribute directly to student certificate completion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingSectionId(null);
              setSectionTitle('');
              setSectionModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all self-start sm:self-auto flex-shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        {/* Sections and Lessons List */}
        {sections.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-3">
            <FolderPlus className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Your curriculum is empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Start building your course structure by creating your first section (e.g. "Module 1: Introduction").
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingSectionId(null);
                setSectionTitle('');
                setSectionModalOpen(true);
              }}
              className="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Create First Section
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section, secIndex) => (
              <div
                key={section._id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm"
              >
                {/* Section Header */}
                <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                      {secIndex + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {section.title}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      ({section.lessons?.length || 0} lessons)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openNewLessonModal(section._id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-brand-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Lesson
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingSectionId(section._id);
                        setSectionTitle(section.title);
                        setSectionModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
                      title="Rename section"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setItemToDelete({
                          type: 'section',
                          id: section._id,
                          title: section.title,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons in Section */}
                <div className="divide-y divide-slate-100">
                  {section.lessons?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No lessons added to this section yet. Click "Add Lesson" above.
                    </div>
                  ) : (
                    section.lessons?.map((lesson: Lesson, lesIndex: number) => (
                      <div
                        key={lesson._id}
                        className="p-4 hover:bg-slate-50/50 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-medium w-4 text-right">
                            {lesIndex + 1}.
                          </span>

                          <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0">
                            {lesson.type === 'video' && <PlayCircle className="w-4 h-4 text-brand-600" />}
                            {lesson.type === 'text' && <FileText className="w-4 h-4 text-indigo-600" />}
                            {lesson.type === 'file' && <Download className="w-4 h-4 text-amber-600" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                {lesson.title}
                              </h4>
                              {lesson.isRequired ? (
                                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                                  Required
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  Optional
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {lesson.type} lesson &bull; {lesson.duration || 0} min
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditLessonModal(section._id, lesson)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                            title="Edit lesson"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setItemToDelete({
                                type: 'lesson',
                                id: lesson._id,
                                title: lesson.title,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section Modal */}
        <Modal
          isOpen={sectionModalOpen}
          onClose={() => setSectionModalOpen(false)}
          title={editingSectionId ? 'Rename Section' : 'Create New Section'}
        >
          <form onSubmit={handleSaveSection} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Module 1: Core Architectural Concepts"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSectionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl shadow-sm"
              >
                Save Section
              </button>
            </div>
          </form>
        </Modal>

        {/* Lesson Modal */}
        <Modal
          isOpen={lessonModalOpen}
          onClose={() => setLessonModalOpen(false)}
          title={editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveLesson} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Designing Database Schemas with Mongoose"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Lesson Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setLessonType('video')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    lessonType === 'video'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PlayCircle className="w-4 h-4" /> Video Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setLessonType('text')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    lessonType === 'text'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Text Lesson
                </button>
                <button
                  type="button"
                  onClick={() => setLessonType('file')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    lessonType === 'file'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Download className="w-4 h-4" /> Resource File
                </button>
              </div>
            </div>

            {/* Required Toggle & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Milestone Requirement
                </label>
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lessonRequired}
                    onChange={(e) => setLessonRequired(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Required for Course Certificate
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Dynamic Content Fields based on Lesson Type */}
            {lessonType === 'video' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">Video Content</label>
                <input
                  type="text"
                  placeholder="Direct video stream URL (MP4, WebM, HLS)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">or upload video file:</span>
                  <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingMedia ? 'Uploading video...' : 'Upload Video File'}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMediaUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {lessonType === 'text' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Lesson Article (HTML or Markdown)
                </label>
                <textarea
                  rows={8}
                  placeholder="Enter formatted lesson text content or HTML..."
                  value={textHtml}
                  onChange={(e) => setTextHtml(e.target.value)}
                  className="w-full p-4 bg-slate-50 font-mono text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            {lessonType === 'file' && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">Downloadable Resource</label>
                <input
                  type="text"
                  placeholder="Download URL"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Resource display name (e.g. CheatSheet.pdf)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-2 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">or attach file:</span>
                  <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingMedia ? 'Uploading...' : 'Attach PDF/ZIP'}
                    <input
                      type="file"
                      onChange={handleMediaUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl shadow-sm"
              >
                Save Lesson
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={`Delete ${itemToDelete?.type === 'section' ? 'Section' : 'Lesson'}`}
          message={`Are you sure you want to delete "${itemToDelete?.title}"? ${
            itemToDelete?.type === 'section'
              ? 'All lessons within this section will also be permanently deleted.'
              : ''
          }`}
          confirmText="Delete"
          isDangerous
          isLoading={deleting}
        />
      </div>
    </div>
  );
};
