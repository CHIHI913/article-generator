'use client';
import { useCompletion } from '@ai-sdk/react';
import { Format } from '@/lib/formats';
import { models } from '@/lib/models';
import { useState, useEffect } from 'react';

export default function ArticlePage() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [formatId, setFormatId] = useState('');
  const [modelId, setModelId] = useState(models[0]?.id || '');
  const { completion, input, handleInputChange, handleSubmit, isLoading, error } =
    useCompletion({
      headers: {
        'Content-Type': 'application/json',
      },
      api: '/api/generate',
      body: { formatId, modelId },
      streamProtocol: 'text',
    });

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const response = await fetch('/api/formats');
        const data = await response.json();
        setFormats(data.formats);
        if (data.formats.length > 0) {
          setFormatId(data.formats[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch formats:', error);
      }
    };
    fetchFormats();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">記事生成</h1>

      <div className="flex gap-4">
        <label className="flex flex-col gap-2 flex-1">
          <span>フォーマット</span>
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            className="border p-2 rounded"
          >
            {formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 flex-1">
          <span>AIモデル</span>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="border p-2 rounded"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span>概要 (10文字以上)</span>
          <textarea
            className="border p-2 h-32 rounded"
            value={input}
            onChange={handleInputChange}
            minLength={10}
            required
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 self-start disabled:opacity-50 rounded"
        >
          {isLoading ? '生成中...' : '生成'}
        </button>
      </form>

      {error && <p className="text-red-600">{error.message}</p>}

      {completion && (
        <section className="border p-4 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded">
          {completion}
        </section>
      )}
    </main>
  );
}
