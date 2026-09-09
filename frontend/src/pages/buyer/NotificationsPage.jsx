import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Package, RotateCcw, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';

export const NotificationsPage = () => {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = async (p = 0) => {
    try {
      setLoading(true);
      const data = await orderService.getNotifications(p, 15);
      setNotifications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(p);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(0);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await orderService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await orderService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
        return <Package size={18} className="text-emerald-600" />;
      case 'RETURN_APPROVED':
      case 'RETURN_REJECTED':
        return <RotateCcw size={18} className="text-amber-600" />;
      default:
        return <Bell size={18} className="text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container py-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated on order movements, returns, and marketplace news
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="btn btn-outline btn-sm text-xs font-semibold flex items-center gap-1.5"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Bell size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500">
            When you place orders or receive shipping updates, you will see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`p-4 rounded-2xl border transition flex items-start gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-200 shadow-sm'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 mt-1.5" title="Unread"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
