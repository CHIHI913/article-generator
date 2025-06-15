import { models } from '@/lib/models';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  return (
    <label className="flex flex-col gap-2 flex-1">
      <span>AIモデル</span>
      <select
        value={selectedModelId}
        onChange={(e) => onModelChange(e.target.value)}
        className="border p-2 rounded"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  );
}