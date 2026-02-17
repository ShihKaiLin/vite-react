import React from "react";
import { X, Upload, Loader2, CheckCircle } from "lucide-react";

export default function PropertyFormModal({
  show,
  editingProperty,
  formData,
  setFormData,
  imagePreviews,
  isUploading,
  uploadSuccess,
  onSubmit,
  onClose,
  onReset,
  onGalleryUpload,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl p-8 my-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {editingProperty ? "編輯物件" : "上架新物件"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {uploadSuccess ? (
          <div className="text-center py-10">
            <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
            <p className="text-xl font-bold mb-6">
              {editingProperty ? "物件更新成功！" : "物件上架成功！"}
            </p>
            <button
              onClick={onReset}
              className="bg-primary text-white px-8 py-2 rounded-xl"
            >
              {editingProperty ? "繼續編輯其他" : "繼續新增"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                placeholder="案名標題"
                className="w-full border p-3 rounded-xl"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <input
                placeholder="地址"
                className="w-full border p-3 rounded-xl"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <div className="flex gap-2">
                <input
                  placeholder="價格(萬)"
                  type="number"
                  className="w-full border p-3 rounded-xl"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                <input
                  placeholder="建坪"
                  type="number"
                  className="w-full border p-3 rounded-xl"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                />
              </div>
              <textarea
                placeholder="物件特色文案"
                className="w-full border p-3 rounded-xl h-32"
                value={formData.expertReview}
                onChange={(e) =>
                  setFormData({ ...formData, expertReview: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-3xl p-10 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={onGalleryUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    點擊上傳照片 (最多 10 張)
                  </p>
                </label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {imagePreviews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-full h-16 object-cover rounded-lg"
                    alt={`preview-${i}`}
                  />
                ))}
              </div>
              <button
                onClick={onSubmit}
                disabled={isUploading}
                className="w-full bg-accent text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" /> 處理中...
                  </>
                ) : (
                  <>
                    <Upload /> {editingProperty ? "確認更新" : "確認上架"}
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full bg-slate-100 text-slate-700 p-3 rounded-xl font-bold"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
