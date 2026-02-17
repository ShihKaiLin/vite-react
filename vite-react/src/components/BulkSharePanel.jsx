import React from "react";
import { Share2, Copy, Loader2 } from "lucide-react";

export default function BulkSharePanel({
  properties,
  selectedIds,
  setSelectedIds,
  shareContent,
  isAnalyzing,
  onBulkShare,
  onEdit,
  onStatusToggle,
  updatingId,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold flex items-center gap-2">
          <Share2 size={20} /> 批量操作區域
        </h4>

        <button
          disabled={selectedIds.length === 0 || isAnalyzing}
          onClick={onBulkShare}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              AI 生成中...
            </span>
          ) : (
            `生成 ${selectedIds.length} 件物件文案`
          )}
        </button>
      </div>

      {shareContent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(shareContent).map(([platform, text]) => (
            <div key={platform} className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-black mb-2 uppercase">{platform}</p>
              <textarea
                className="w-full h-24 text-xs p-2 border rounded"
                value={text}
                readOnly
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(text);
                  alert("已複製");
                }}
                className="mt-2 text-xs text-accent flex items-center gap-1"
              >
                <Copy size={12} /> 複製文案
              </button>
            </div>
          ))}
        </div>
      )}

      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-slate-400 border-b">
            <th className="p-4">
              <input
                type="checkbox"
                onChange={(e) => {
                  const realIds = properties
                    .filter((p) => !String(p.id).startsWith("demo"))
                    .map((p) => p.id);

                  setSelectedIds(e.target.checked ? realIds : []);
                }}
              />
            </th>
            <th className="p-4">物件名稱</th>
            <th className="p-4">狀態</th>
            <th className="p-4">操作</th>
          </tr>
        </thead>

        <tbody>
          {properties
            .filter((p) => !String(p.id).startsWith("demo"))
            .map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((i) => i !== p.id)
                          : [...prev, p.id]
                      )
                    }
                  />
                </td>
                <td className="p-4 font-bold">{p.title}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.status === "銷售中"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => onEdit(p)}
                    className="text-xs font-bold text-primary hover:text-accent"
                  >
                    編輯
                  </button>

                  <button
                    onClick={() => onStatusToggle(p.id, p.status)}
                    className="text-xs font-bold text-accent"
                  >
                    {updatingId === p.id
                      ? "處理中..."
                      : p.status === "銷售中"
                      ? "改為已售出"
                      : "恢復銷售"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
