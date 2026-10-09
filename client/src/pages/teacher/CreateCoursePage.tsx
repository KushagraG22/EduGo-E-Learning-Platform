import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../../services/api';

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Web Development',
    'Data Science',
    'Design',
    'DevOps & Cloud',
    'Mobile Development',
    'Computer Science',
    'Artificial Intelligence',
  ];

  const handleAddObjective = () => setLearningObjectives([...learningObjectives, '']);
  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };
  const handleObjectiveChange = (index: number, val: string) => {
    const updated = [...learningObjectives];
    updated[index] = val;
    setLearningObjectives(updated);
  };

  const handleAddPrerequisite = () => setPrerequisites([...prerequisites, '']);
  const handleRemovePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };
  const handlePrerequisiteChange = (index: number, val: string) => {
    const updated = [...prerequisites];
    updated[index] = val;
    setPrerequisites(updated);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !summary.trim() || !description.trim()) {
      setError('Please provide course title, short summary, and full description.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/courses', {
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

      if (res.data?.success && res.data?.course?._id) {
        // Redirect directly to Curriculum Builder to add lessons!
        navigate(`/teacher/courses/${res.data.course._id}/curriculum`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back navigation */}
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </Link>

        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Step 1 of 2
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create a New Course Draft
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your course details first. Next, you will organize curriculum sections and upload video or text lessons.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Full-Stack Web Architecture with React & Node"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Category & Difficulty Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
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
                className="w-full px-3 py-2.5 bg-slate-50 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 font-medium"
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
                placeholder="e.g. 5 Hours"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Short Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              maxLength={300}
              placeholder="A concise 1-2 sentence overview of the course shown on discovery cards..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <span className="text-[10px] text-slate-400 block text-right mt-1">{summary.length}/300 chars</span>
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Description (HTML or Text) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              placeholder="Detailed explanation of what this course covers, teaching methodology, syllabus overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono text-xs"
            />
          </div>

          {/* Thumbnail URL or Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Course Thumbnail
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input
                type="text"
                placeholder="https://example.com/thumbnail.jpg or upload below"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="flex-1 w-full px-4 py-2.5 bg-slate-50 text-sm text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
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

          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">What will students learn?</label>
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Learning milestone #${i + 1}`}
                    value={obj}
                    onChange={(e) => handleObjectiveChange(i, e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  {learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(i)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Prerequisites</label>
              <button
                type="button"
                onClick={handleAddPrerequisite}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Prerequisite
              </button>
            </div>
            <div className="space-y-2">
              {prerequisites.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Prerequisite #${i + 1}`}
                    value={req}
                    onChange={(e) => handlePrerequisiteChange(i, e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
                  />
                  {prerequisites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrerequisite(i)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/teacher/courses"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Saving Draft...' : 'Save Draft & Build Curriculum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
