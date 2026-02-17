import React, { useState } from "react";
import { X, Upload, Loader2, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { extractPropertyInfo } from "@/lib/gemini";
import { DISTRICT_HIERARCHY, PROPERTY_TYPES } from "@/lib/constants";

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
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [extractionError, setExtractionError] = useState(null);

  if (!show) return null;

  const handleAIExtract = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // 檔案類型驗證
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      alert('僅支援 JPG, PNG, WEBP, PDF 格式');
      return;
    }
    
    // 檔案數量限制
    if (files.length > 5) {
      alert('最多只能上傳 5 個檔案');
      return;
    }
    
    setIsExtracting(true);
    setExtractionError(null);
    setExtractionResult(null);
    
    try {
      const result = await extractPropertyInfo(files);
      
      if (result.success && result.data) {
        // 自動填入表單（保留已有的圖片）
        setFormData({
          ...formData,
          title: result.data.title || formData.title,
          address: result.data.address || formData.address,
          district: result.data.district || formData.district,
          price: result.data.price ? String(result.data.price) : formData.price,
          area: result.data.area ? String(result.data.area) : formData.area,
          buildingArea: result.data.buildingArea ? String(result.data.buildingArea) : formData.buildingArea,
          publicArea: result.data.publicArea ? String(result.data.publicArea) : formData.publicArea,
          rooms: result.data.rooms ? String(result.data.rooms) : formData.rooms,
          halls: result.data.halls ? String(result.data.halls) : formData.halls,
          bathrooms: result.data.bathrooms ? String(result.data.bathrooms) : formData.bathrooms,
          type: result.data.type || formData.type,
          floor: result.data.floor ? String(result.data.floor) : formData.floor,
          totalFloors: result.data.totalFloors ? String(result.data.totalFloors) : formData.totalFloors,
          age: result.data.age ? String(result.data.age) : formData.age,
          managementFee: result.data.managementFee ? String(result.data.managementFee) : formData.managementFee,
          constructionMaterial: result.data.constructionMaterial || formData.constructionMaterial,
          expertReview: result.data.expertReview || formData.expertReview,
        });
        
        setExtractionResult(result.data);
      } else {
        throw new Error('AI 辨識失敗，請手動輸入');
      }
    } catch (err) {
      console.error('AI extraction error:', err);
      setExtractionError(err.message || 'AI 辨識失敗，請手動輸入');
    } finally {
      setIsExtracting(false);
      e.target.value = ''; // 清空 input
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl p-8 my-8 max-h-[90vh] overflow-y-auto">
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
          <div className="space-y-6">
            {/* AI 辨識區域 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="text-purple-600" size={28} />
                  <h3 className="text-2xl font-bold text-purple-900">
                    🤖 AI 智能辨識
                  </h3>
                </div>
                <p className="text-sm text-purple-700">
                  上傳物件圖片或 PDF，AI 自動提取資訊並填入表單
                </p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                id="ai-extract-upload"
                onChange={handleAIExtract}
                disabled={isExtracting}
              />
              
              <label
                htmlFor="ai-extract-upload"
                className={`block cursor-pointer ${isExtracting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors">
                  <div className="flex flex-col items-center gap-3">
                    {isExtracting ? (
                      <>
                        <Loader2 className="animate-spin text-purple-600" size={48} />
                        <p className="text-lg font-bold text-purple-900">AI 辨識中...</p>
                        <p className="text-sm text-purple-600">
                          正在分析圖片內容，請稍候
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                          <Upload className="text-white" size={32} />
                        </div>
                        <p className="text-lg font-bold text-purple-900">
                          點擊上傳圖片或 PDF
                        </p>
                        <p className="text-sm text-purple-600">
                          支援格式：JPG, PNG, WEBP, PDF（最多 5 個檔案）
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </label>

              {extractionResult && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-800 mb-1">
                        ✅ AI 辨識完成
                      </p>
                      <p className="text-xs text-green-700 mb-2">
                        信心度：{((extractionResult.confidence || 0) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-green-600">
                        已自動填入表單，請檢查並修正資訊
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {extractionError && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-red-800 mb-1">
                        ❌ 辨識失敗
                      </p>
                      <p className="text-xs text-red-600">
                        {extractionError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-slate-400 font-bold">
              或手動輸入
            </div>

            {/* 表單區域 */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* 左欄 */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">案名標題 *</label>
                  <input
                    placeholder="例：國美館豪宅"
                    className="w-full border p-3 rounded-xl"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">地址 *</label>
                  <input
                    placeholder="例：台中市西區館前路100號"
                    className="w-full border p-3 rounded-xl"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">行政區 *</label>
                  <select
                    className="w-full border p-3 rounded-xl"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                  >
                    {DISTRICT_HIERARCHY.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">物件類型 *</label>
                  <select
                    className="w-full border p-3 rounded-xl"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 中欄 */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">總價(萬) *</label>
                    <input
                      placeholder="8500"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">建坪 *</label>
                    <input
                      placeholder="85"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">主建物</label>
                    <input
                      placeholder="75"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.buildingArea}
                      onChange={(e) =>
                        setFormData({ ...formData, buildingArea: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">公設</label>
                    <input
                      placeholder="10"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.publicArea}
                      onChange={(e) =>
                        setFormData({ ...formData, publicArea: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">房</label>
                    <input
                      placeholder="3"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.rooms}
                      onChange={(e) =>
                        setFormData({ ...formData, rooms: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">廳</label>
                    <input
                      placeholder="2"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.halls}
                      onChange={(e) =>
                        setFormData({ ...formData, halls: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">衛</label>
                    <input
                      placeholder="2"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">樓層</label>
                    <input
                      placeholder="15"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">總樓層</label>
                    <input
                      placeholder="25"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.totalFloors}
                      onChange={(e) =>
                        setFormData({ ...formData, totalFloors: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">屋齡(年)</label>
                    <input
                      placeholder="5"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">管理費</label>
                    <input
                      placeholder="8000"
                      type="number"
                      className="w-full border p-3 rounded-xl"
                      value={formData.managementFee}
                      onChange={(e) =>
                        setFormData({ ...formData, managementFee: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 mb-1 block">建材</label>
                  <select
                    className="w-full border p-3 rounded-xl"
                    value={formData.constructionMaterial}
                    onChange={(e) =>
                      setFormData({ ...formData, constructionMaterial: e.target.value })
                    }
                  >
                    <option value="RC">RC</option>
                    <option value="SRC">SRC</option>
                    <option value="SC">SC</option>
                    <option value="加強磚造">加強磚造</option>
                  </select>
                </div>
              </div>

              {/* 右欄 */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">物件特色</label>
                  <textarea
                    placeholder="位於國美館正對面，擁有絕佳視野..."
                    className="w-full border p-3 rounded-xl h-32"
                    value={formData.expertReview}
                    onChange={(e) =>
                      setFormData({ ...formData, expertReview: e.target.value })
                    }
                  />
                </div>

                <div className="border-2 border-dashed rounded-2xl p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="manual-upload"
                    onChange={onGalleryUpload}
                  />
                  <label htmlFor="manual-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      上傳物件照片（最多 10 張）
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
          </div>
        )}
      </div>
    </div>
  );
}
