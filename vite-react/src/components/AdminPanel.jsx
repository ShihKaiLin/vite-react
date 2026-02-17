import React from "react";
import { LayoutGrid, CheckCircle, Zap } from "lucide-react";
import BulkSharePanel from "./BulkSharePanel";

export default function AdminPanel({
  show,
  statsData,
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
  if (!show) return null;

  return (
    <section className="bg-slate-50 py-10 container rounded-3xl border mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <LayoutGrid className="text-accent" />
          <div>
            <p className="text-xs text-slate-400">總物件</p>
            <p className="text-2xl font-black">{statsData.totalCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-xs text-slate-400">已成交</p>
            <p className="text-2xl font-black">{statsData.soldCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <Zap className="text-blue-500" />
          <div>
            <p className="text-xs text-slate-400">銷售中</p>
            <p className="text-2xl font-black">{statsData.activeCount}</p>
          </div>
        </div>
      </div>

      <BulkSharePanel
        properties={properties}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        shareContent={shareContent}
        isAnalyzing={isAnalyzing}
        onBulkShare={onBulkShare}
        onEdit={onEdit}
        onStatusToggle={onStatusToggle}
        updatingId={updatingId}
      />
    </section>
  );
}
