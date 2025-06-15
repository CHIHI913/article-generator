'use client';
import { useCompletion } from '@ai-sdk/react';
import { Format } from '@/lib/formats';
import { models } from '@/lib/models';
import { useState, useEffect } from 'react';

interface ErrorInfo {
  message: string;
  code?: string;
  retryable?: boolean;
}

function getErrorInfo(error: Error): ErrorInfo {
  try {
    const errorData = JSON.parse(error.message);
    if (errorData.error && errorData.code) {
      return {
        message: errorData.error,
        code: errorData.code,
        retryable: ['RATE_LIMIT_EXCEEDED', 'GENERATION_FAILED', 'NETWORK_ERROR'].includes(errorData.code)
      };
    }
  } catch {
    // JSONパース失敗時は元のメッセージを使用
  }
  
  return {
    message: error.message,
    retryable: true
  };
}

export default function ArticlePage() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [formatId, setFormatId] = useState('');
  const [modelId, setModelId] = useState(models[0]?.id || '');
  const [formatError, setFormatError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { completion, input, handleInputChange, handleSubmit, isLoading, error, stop } =
    useCompletion({
      headers: {
        'Content-Type': 'application/json',
      },
      api: '/api/generate',
      body: { formatId, modelId },
      streamProtocol: 'text',
      onError: (error) => {
        console.error('Generation error:', error);
        setRetryCount(prev => prev + 1);
      },
      onFinish: () => {
        setRetryCount(0);
      },
    });

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        setFormatError(null);
        const response = await fetch('/api/formats');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setFormats(data.formats);
        if (data.formats.length > 0) {
          setFormatId(data.formats[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch formats:', error);
        setFormatError('フォーマットの取得に失敗しました。ページを再読み込みしてください。');
        // フォールバック: デフォルトフォーマットを設定
        setFormats([]);
        setFormatId('');
      }
    };
    fetchFormats();
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    handleSubmit();
  };

  const errorInfo = error ? getErrorInfo(error) : null;

  return (
    <main className="max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">記事生成</h1>

      {formatError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-400 mt-0.5">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">フォーマット読み込みエラー</p>
              <p className="text-red-600 text-sm mt-1">{formatError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex flex-col gap-2 flex-1">
          <span>フォーマット</span>
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            className="border p-2 rounded disabled:bg-gray-100 disabled:text-gray-500"
            disabled={formatError !== null}
          >
            {formats.length === 0 && !formatError ? (
              <option value="">読み込み中...</option>
            ) : (
              formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))
            )}
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
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || formatError !== null}
            className="bg-black text-white px-4 py-2 disabled:opacity-50 rounded"
          >
            {isLoading ? '生成中...' : '生成'}
          </button>
          {isLoading && (
            <button
              type="button"
              onClick={stop}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              停止
            </button>
          )}
        </div>
      </form>

      {errorInfo && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-red-400 mt-0.5">🚨</div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">エラーが発生しました</p>
              <p className="text-red-600 text-sm mt-1">{errorInfo.message}</p>
              {errorInfo.code && (
                <p className="text-red-500 text-xs mt-1">エラーコード: {errorInfo.code}</p>
              )}
              {errorInfo.retryable && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                    disabled={isLoading}
                  >
                    再試行
                  </button>
                  {retryCount > 0 && (
                    <span className="text-red-500 text-sm self-center">
                      再試行回数: {retryCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {completion && (
        <section className="border p-4 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded">
          {completion}
        </section>
      )}
    </main>
  );
}
