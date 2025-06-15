'use client';
import { useCompletion } from '@ai-sdk/react';
import { Format } from '@/lib/formats';
import { models } from '@/lib/models';
import { useState, useEffect } from 'react';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { FormatSelector } from '@/components/FormatSelector';
import { ModelSelector } from '@/components/ModelSelector';
import { ArticleGenerationForm } from '@/components/ArticleGenerationForm';
import { ArticleOutput } from '@/components/ArticleOutput';
import { isErrorResponse } from '@/lib/type-guards';

interface ErrorInfo {
  message: string;
  code?: string;
  retryable?: boolean;
}

function getErrorInfo(error: Error): ErrorInfo {
  try {
    const errorData = JSON.parse(error.message);
    if (isErrorResponse(errorData)) {
      return {
        message: errorData.error,
        code: errorData.code,
        retryable: errorData.code ? ['RATE_LIMIT_EXCEEDED', 'GENERATION_FAILED', 'NETWORK_ERROR'].includes(errorData.code) : true
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
        
        if (Array.isArray(data.formats)) {
          setFormats(data.formats);
          if (data.formats.length > 0 && data.formats[0]?.id) {
            setFormatId(data.formats[0].id);
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to fetch formats:', error);
        setFormatError('フォーマットの取得に失敗しました。ページを再読み込みしてください。');
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
        <ErrorDisplay
          title="フォーマット読み込みエラー"
          message={formatError}
        />
      )}

      <div className="flex gap-4">
        <FormatSelector
          formats={formats}
          selectedFormatId={formatId}
          onFormatChange={setFormatId}
          isLoading={formats.length === 0 && !formatError}
          error={formatError}
        />
        <ModelSelector
          selectedModelId={modelId}
          onModelChange={setModelId}
        />
      </div>

      <ArticleGenerationForm
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onStop={stop}
        isLoading={isLoading}
        isDisabled={formatError !== null}
      />

      {errorInfo && (
        <ErrorDisplay
          title="エラーが発生しました"
          message={errorInfo.message}
          code={errorInfo.code}
          retryable={errorInfo.retryable}
          onRetry={handleRetry}
          retryCount={retryCount}
          isLoading={isLoading}
        />
      )}

      {isLoading && !completion && <LoadingSkeleton />}

      {completion && <ArticleOutput content={completion} />}
    </main>
  );
}
