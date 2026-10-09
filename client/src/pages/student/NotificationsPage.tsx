import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Award, Megaphone, CheckCircle2, BookOpen } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      markAsRead(n._id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-indigo-500" />;
      case 'completion':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'enrollment':
        return <BookOpen className="w-5 h-5 text-brand-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              In-App Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Stay updated on course announcements, milestone completions, and certificates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-brand-600 hover:text-brand-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You will receive updates here when you enroll, finish courses, or when your teachers post announcements.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-start gap-4 ${
                  !n.isRead ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex-shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h3>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
