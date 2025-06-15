interface ErrorDisplayProps {
  title: string;
  message: string;
  code?: string;
  retryable?: boolean;
  onRetry?: () => void;
  retryCount?: number;
  isLoading?: boolean;
}

export function ErrorDisplay({
  title,
  message,
  code,
  retryable,
  onRetry,
  retryCount = 0,
  isLoading = false
}: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-red-400 mt-0.5">🚨</div>
        <div className="flex-1">
          <p className="text-red-800 font-medium">{title}</p>
          <p className="text-red-600 text-sm mt-1">{message}</p>
          {code && (
            <p className="text-red-500 text-xs mt-1">エラーコード: {code}</p>
          )}
          {retryable && onRetry && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={onRetry}
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
  );
}