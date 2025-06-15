'use client';
import { useCompletion } from '@ai-sdk/react';
import { defaultFormats } from '@/lib/formats';
import { useState } from 'react';

export default function ArticlePage() {
  const [formatId, setFormatId] = useState(defaultFormats[0].id);
  const { completion, input, handleInputChange, handleSubmit, isLoading, error } =
    useCompletion({
      headers: {
        'Content-Type': 'application/json',
      },
      api: '/api/generate',
      body: { formatId },
      streamProtocol: 'text',
    });

  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">記事生成</h1>

      <label className="flex flex-col gap-2">
        <span>フォーマット</span>
        <select
          value={formatId}
          onChange={(e) => setFormatId(e.target.value)}
          className="border p-2"
        >
          {defaultFormats.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span>概要 (10文字以上)</span>
          <textarea
            className="border p-2 h-32"
            value={input}
            onChange={handleInputChange}
            minLength={10}
            required
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 self-start disabled:opacity-50"
        >
          {isLoading ? '生成中...' : '生成'}
        </button>
      </form>

      {error && <p className="text-red-600">{error.message}</p>}

      {completion && (
        <section className="border p-4 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800">
          {completion}
        </section>
      )}
    </main>
  );
}
