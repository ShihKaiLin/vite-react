import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home as HomeIcon,
  User,
  BarChart3,
  Plus,
  Search,
} from "lucide-react";

import "leaflet/dist/leaflet.css";

import {
  DISTRICT_HIERARCHY,
  PROPERTY_TYPES,
  normalizePrice,
  CONTACT_INFO,
} from "@/lib/constants";

import {
  subscribeToProperties,
  saveProperty,
  updateProperty,
  updatePropertyStatus,
  uploadImage,
} from "@/lib/firebase";

import { generateShareCopy } from "@/lib/gemini";

import PropertyCard from "@/components/PropertyCard";
import PropertyFormModal from "@/components/PropertyFormModal";
import AdminPanel from "@/components/AdminPanel";
import LoginModal from "@/components/LoginModal";

// ------------------ DEMO DATA ------------------
const DEMO_PROPERTIES = [
  {
    id: "demo1",
    title: "國美館豪宅 頂級享受",
    address: "台中市西區館前路100號",
    district: "西區",
    price: 8500,
    area: 85,
    buildingArea: 75,
    publicArea: 10,
    rooms: 3,
    halls: 2,
    bathrooms: 2,
    type: "大樓",
    expertReview:
      "位於國美館正對面,擁有絕佳視野。高樓層、採光良好、社區設施完善。",
    status: "銷售中",
    floor: 15,
    totalFloors: 25,
    managementFee: 8000,
    constructionMaterial: "RC",
    age: 5,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1200",
    ],
    viewCount: 245,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ------------------ HELPERS ------------------
function getAllDistricts() {
  if (Array.isArray(DISTRICT_HIERARCHY)) return DISTRICT_HIERARCHY;
  try {
    return Object.values(DISTRICT_HIERARCHY).flat();
  } catch {
    return [];
  }
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function HomePage() {
  // --- State Management ---
  const [filters, setFilters] = useState({
    district: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  const [properties, setProperties] = useState([...DEMO_PROPERTIES]);
  const [filteredProperties, setFilteredProperties] = useState([
    ...DEMO_PROPERTIES,
  ]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [shareContent, setShareContent] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [editingProperty, setEditingProperty] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    district: "西區",
    price: "",
    area: "",
    buildingArea: "",
    publicArea: "",
    rooms: "",
    halls: "",
    bathrooms: "",
    type: "大樓",
    expertReview: "",
    status: "銷售中",
    floor: "",
    totalFloors: "",
    managementFee: "",
    constructionMaterial: "RC",
    age: "",
    images: [],
  });

  // --- 統計數據 ---
  const statsData = useMemo(() => {
    return {
      totalCount: properties.filter((p) => !String(p.id).startsWith("demo"))
        .length,
      soldCount: properties.filter((p) => p.status === "已售出").length,
      activeCount: properties.filter((p) => p.status === "銷售中").length,
    };
  }, [properties]);

  // --- navbar scroll ---
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Firebase 訂閱 ---
  useEffect(() => {
    const unsubscribe = subscribeToProperties(
      (firebaseProps) => {
        const demoIds = new Set(DEMO_PROPERTIES.map((d) => d.id));
        const merged = [
          ...DEMO_PROPERTIES,
          ...firebaseProps.filter((p) => !demoIds.has(p.id)),
        ];
        setProperties(merged);
      },
      (err) => setSaveError("無法載入數據")
    );
    return () => unsubscribe();
  }, []);

  // --- 過濾邏輯 ---
  useEffect(() => {
    let result = properties.filter((p) => p.status === "銷售中");

    if (filters.district)
      result = result.filter((p) => p.district === filters.district);
    if (filters.type) result = result.filter((p) => p.type === filters.type);

    if (filters.minPrice) {
      result = result.filter(
        (p) => normalizePrice(p.price) >= safeNumber(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (p) => normalizePrice(p.price) <= safeNumber(filters.maxPrice)
      );
    }

    setFilteredProperties(result);
  }, [properties, filters]);

  // --- Admin Login ---
  const handleAdminLogin = () => {
    const pass = import.meta.env.VITE_ADMIN_PASS || "8888";
    if (adminPassword === pass) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPassword("");
    } else {
      alert("密碼錯誤");
    }
  };

  const handleAdminLogout = () => setIsAdmin(false);

  // --- Upload / Preview ---
  const objectUrlRef = useRef([]);

  const cleanupObjectUrls = () => {
    objectUrlRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlRef.current = [];
  };

  useEffect(() => {
    return () => cleanupObjectUrls();
  }, []);

  const handleGalleryUpload = (e) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    const urls = files.map((file) => {
      const u = URL.createObjectURL(file);
      objectUrlRef.current.push(u);
      return u;
    });

    setImagePreviews((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      address: "",
      district: "西區",
      price: "",
      area: "",
      buildingArea: "",
      publicArea: "",
      rooms: "",
      halls: "",
      bathrooms: "",
      type: "大樓",
      expertReview: "",
      status: "銷售中",
      floor: "",
      totalFloors: "",
      managementFee: "",
      constructionMaterial: "RC",
      age: "",
      images: [],
    });

    setImagePreviews([]);
    setImageFiles([]);
    setEditingProperty(null);
    cleanupObjectUrls();
  };

  const openCreate = () => {
    setUploadSuccess(false);
    setEditingProperty(null);
    resetForm();
    setShowAddForm(true);
  };

  const openEdit = (p) => {
    setUploadSuccess(false);
    setEditingProperty(p);

    setFormData({
      title: p.title || "",
      address: p.address || "",
      district: p.district || "西區",
      price: String(p.price ?? ""),
      area: String(p.area ?? ""),
      buildingArea: String(p.buildingArea ?? ""),
      publicArea: String(p.publicArea ?? ""),
      rooms: String(p.rooms ?? ""),
      halls: String(p.halls ?? ""),
      bathrooms: String(p.bathrooms ?? ""),
      type: p.type || "大樓",
      expertReview: p.expertReview || "",
      status: p.status || "銷售中",
      floor: String(p.floor ?? ""),
      totalFloors: String(p.totalFloors ?? ""),
      managementFee: String(p.managementFee ?? ""),
      constructionMaterial: p.constructionMaterial || "RC",
      age: String(p.age ?? ""),
      images: Array.isArray(p.images) ? p.images : [],
    });

    setImagePreviews(Array.isArray(p.images) ? p.images : []);
    setImageFiles([]);
    cleanupObjectUrls();

    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    setSaveError(null);

    if (!formData.title || !formData.price || !formData.area) {
      alert("請至少填寫:標題、價格、建坪");
      return;
    }

    setIsUploading(true);

    try {
      let uploadedUrls = Array.isArray(formData.images) ? [...formData.images] : [];

      if (imageFiles.length > 0) {
        const newUrls = await Promise.all(
          imageFiles.map((file) => uploadImage(file))
        );
        uploadedUrls = [...uploadedUrls, ...newUrls];
      }

      const payload = {
        ...formData,
        price: safeNumber(formData.price),
        area: safeNumber(formData.area),
        buildingArea: safeNumber(formData.buildingArea),
        publicArea: safeNumber(formData.publicArea),
        rooms: safeNumber(formData.rooms),
        halls: safeNumber(formData.halls),
        bathrooms: safeNumber(formData.bathrooms),
        floor: safeNumber(formData.floor),
        totalFloors: safeNumber(formData.totalFloors),
        managementFee: safeNumber(formData.managementFee),
        age: safeNumber(formData.age),
        images: uploadedUrls,
        status: formData.status || "銷售中",
      };

      if (editingProperty?.id) {
        await updateProperty(editingProperty.id, {
          ...payload,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await saveProperty({
          ...payload,
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setUploadSuccess(true);
      setImageFiles([]);
      cleanupObjectUrls();
    } catch (err) {
      setSaveError("上傳失敗,請檢查網路連接");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (!id) return;
    setUpdatingId(id);

    const newStatus = currentStatus === "銷售中" ? "已售出" : "銷售中";

    try {
      await updatePropertyStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkShare = async () => {
    setIsAnalyzing(true);
    setShareContent(null);
    setSaveError(null);

    try {
      const selected = properties.filter(
        (p) => selectedIds.includes(p.id) && !String(p.id).startsWith("demo")
      );

      if (selected.length === 0) {
        alert("請選取至少 1 筆(非 demo)物件");
        return;
      }

      const result = await generateShareCopy(selected);

      setShareContent({
        fb: result?.fb || "",
        line: result?.line || "",
        threads: result?.threads || "",
      });
    } catch (e) {
      setSaveError("AI 生成失敗,請稍後再試");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ALL_DISTRICTS = useMemo(() => getAllDistricts(), []);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 py-4 flex items-center justify-between ${
          isScrolled || isAdmin
            ? "bg-white shadow-lg"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="bg-primary p-2 rounded-xl text-white">
            <HomeIcon size={24} />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-primary">
              國美館宅生活
            </h1>
            <p className="text-[9px] tracking-[0.2em] font-medium text-accent uppercase">
              翱翔大台中
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-bold text-primary">
          <button
            onClick={() =>
              isAdmin ? setShowStats(!showStats) : setShowLoginModal(true)
            }
            className="hover:text-accent transition-colors flex items-center gap-2"
          >
            {isAdmin ? (
              <>
                <BarChart3 size={14} /> 市場面板
              </>
            ) : (
              <>
                <User size={14} /> 管理員登入
              </>
            )}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={openCreate}
                className="bg-accent text-white px-5 py-1.5 rounded-lg shadow-md flex items-center gap-2"
              >
                <Plus size={14} /> 上架物件
              </button>
              <button
                onClick={handleAdminLogout}
                className="text-slate-400 hover:text-slate-600"
              >
                登出
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070")',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="container relative z-10 text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#B39158] mb-4">
            國美館宅生活
          </h1>
          <p className="text-xl text-white/90">林世塏的精品居住分享</p>
        </div>
      </section>

      {/* Search Panel */}
      <section className="container -mt-10 relative z-20">
        <div className="bg-white p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.district}
            onChange={(e) =>
              setFilters({ ...filters, district: e.target.value })
            }
            className="bg-slate-50 p-3 rounded-xl font-bold"
          >
            <option value="">所有行政區</option>
            {ALL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="bg-slate-50 p-3 rounded-xl font-bold"
          >
            <option value="">所有類型</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="最低(萬)"
              className="w-full bg-slate-50 p-3 rounded-xl"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="最高(萬)"
              className="w-full bg-slate-50 p-3 rounded-xl"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
            />
          </div>

          <button className="bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Search size={18} /> 搜尋
          </button>
        </div>
      </section>

      {/* Error */}
      {saveError && (
        <div className="container mt-6">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
            {saveError}
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <section className="py-20 container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* Admin Stats Panel */}
      <AdminPanel
        show={isAdmin && showStats}
        statsData={statsData}
        properties={properties}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        shareContent={shareContent}
        isAnalyzing={isAnalyzing}
        onBulkShare={handleBulkShare}
        onEdit={openEdit}
        onStatusToggle={handleStatusToggle}
        updatingId={updatingId}
      />

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        password={adminPassword}
        setPassword={setAdminPassword}
        onLogin={handleAdminLogin}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Add / Edit Form Modal */}
      <PropertyFormModal
        show={showAddForm}
        editingProperty={editingProperty}
        formData={formData}
        setFormData={setFormData}
        imagePreviews={imagePreviews}
        isUploading={isUploading}
        uploadSuccess={uploadSuccess}
        onSubmit={handleSubmit}
        onClose={() => {
          setShowAddForm(false);
          setEditingProperty(null);
        }}
        onReset={() => {
          setUploadSuccess(false);
          resetForm();
        }}
        onGalleryUpload={handleGalleryUpload}
      />

      <footer className="bg-slate-900 text-white py-12 text-center">
        <p className="text-lg font-bold mb-2">國美館宅生活 翱翔大台中</p>
        <p className="text-sm text-slate-400">
          © 2026 林世塏 (Rock Lin) - 專業房地產顧問
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {CONTACT_INFO?.phone ? `聯絡電話:${CONTACT_INFO.phone}` : ""}
        </p>
      </footer>
    </div>
  );
}
