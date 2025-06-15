'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Format } from '@/lib/formats';

export default function FormatsPage() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFormat, setEditingFormat] = useState<Format | null>(null);
  const [formData, setFormData] = useState({ name: '', template: '' });

  useEffect(() => {
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    try {
      const response = await fetch('/api/formats');
      const data = await response.json();
      setFormats(data.formats);
    } catch (error) {
      console.error('Failed to fetch formats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchFormats();
        setShowCreateModal(false);
        setFormData({ name: '', template: '' });
      }
    } catch (error) {
      console.error('Failed to create format:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFormat) return;

    try {
      const response = await fetch(`/api/formats/${editingFormat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchFormats();
        setEditingFormat(null);
        setFormData({ name: '', template: '' });
      }
    } catch (error) {
      console.error('Failed to update format:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このフォーマットを削除しますか？')) return;

    try {
      const response = await fetch(`/api/formats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFormats();
      }
    } catch (error) {
      console.error('Failed to delete format:', error);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', template: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (format: Format) => {
    setFormData({ name: format.name, template: format.template });
    setEditingFormat(format);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingFormat(null);
    setFormData({ name: '', template: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">フォーマット管理</h1>
            <p className="text-gray-600 mt-2">記事生成用のフォーマットを管理できます</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ホームに戻る
            </Link>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規作成
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formats.map((format) => (
            <div key={format.id} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{format.name}</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 mb-4 max-h-32 overflow-y-auto">
                {format.template.substring(0, 200)}
                {format.template.length > 200 && '...'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(format)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(format.id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        {(showCreateModal || editingFormat) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingFormat ? 'フォーマット編集' : 'フォーマット作成'}
              </h2>
              <form onSubmit={editingFormat ? handleUpdate : handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    フォーマット名
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    テンプレート
                  </label>
                  <textarea
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64 font-mono text-sm"
                    placeholder="## タイトル&#10;{{title}}&#10;&#10;## 本文&#10;{{content}}"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {'{'}placeholder{'}'} 形式で動的コンテンツを指定できます
                  </p>
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingFormat ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}