import { FormEvent } from 'react';

interface ArticleGenerationFormProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function ArticleGenerationForm({
  input,
  onInputChange,
  onSubmit,
  onStop,
  isLoading,
  isDisabled
}: ArticleGenerationFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span>概要 (10文字以上)</span>
        <textarea
          className="border p-2 h-32 rounded"
          value={input}
          onChange={onInputChange}
          minLength={10}
          required
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading || isDisabled}
          className="bg-black text-white px-4 py-2 disabled:opacity-50 rounded"
        >
          {isLoading ? '生成中...' : '生成'}
        </button>
        {isLoading && (
          <button
            type="button"
            onClick={onStop}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            停止
          </button>
        )}
      </div>
    </form>
  );
}