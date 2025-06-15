import { Format } from '@/lib/formats';

interface FormatSelectorProps {
  formats: Format[];
  selectedFormatId: string;
  onFormatChange: (formatId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FormatSelector({
  formats,
  selectedFormatId,
  onFormatChange,
  isLoading = false,
  error = null
}: FormatSelectorProps) {
  return (
    <label className="flex flex-col gap-2 flex-1">
      <span className="flex items-center gap-2">
        フォーマット
        {isLoading && (
          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
        )}
      </span>
      <select
        value={selectedFormatId}
        onChange={(e) => onFormatChange(e.target.value)}
        className="border p-2 rounded disabled:bg-gray-100 disabled:text-gray-500"
        disabled={error !== null || isLoading}
      >
        {isLoading && formats.length === 0 ? (
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
  );
}