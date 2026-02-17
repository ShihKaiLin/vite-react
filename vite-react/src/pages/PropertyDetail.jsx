import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Home, ArrowLeft } from "lucide-react";
import { getPropertyById, incrementViewCount } from "@/lib/firebase";
import { normalizePrice, formatPrice, CONTACT_INFO } from "@/lib/constants";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      try {
        const data = await getPropertyById(id);
        if (data) {
          setProperty(data);
          if (!String(id).startsWith("demo")) {
            await incrementViewCount(id);
          }
        }
      } catch (err) {
        console.error("Failed to load property:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-500">載入中...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-500 mb-4">找不到此物件</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2 rounded-xl"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  const PriceDisplay = ({ price }) => {
    const { yi, wan } = formatPrice(normalizePrice(price));
    return (
      <span>
        {yi > 0 ? `${yi}億` : ""}
        {wan}萬
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-white shadow-lg px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors"
        >
          <ArrowLeft size={20} />
          返回首頁
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-white">
            <Home size={20} />
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold text-primary">
              國美館宅生活
            </h1>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <img
                src={property.images?.[0] || ""}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Gallery */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {property.images.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${property.title}-${i + 1}`}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                ))}
              </div>
            )}

            {/* Property Info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
              <p className="text-slate-500 flex items-center gap-2 mb-6">
                <MapPin size={18} /> {property.address}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">建坪</p>
                  <p className="text-xl font-bold">{property.area} 坪</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">房型</p>
                  <p className="text-xl font-bold">{property.rooms} 房</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">類型</p>
                  <p className="text-xl font-bold">{property.type}</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">瀏覽</p>
                  <p className="text-xl font-bold">{property.viewCount}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-3">物件特色</h3>
                <p className="text-slate-600 leading-relaxed">
                  {property.expertReview || "暫無描述"}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-lg sticky top-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-400 mb-2">總價</p>
                <p className="text-4xl font-black text-accent">
                  <PriceDisplay price={property.price} />
                </p>
              </div>

              <div className="border-t border-b py-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">行政區</span>
                  <span className="font-bold">{property.district}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">樓層</span>
                  <span className="font-bold">
                    {property.floor}/{property.totalFloors}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">屋齡</span>
                  <span className="font-bold">{property.age} 年</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">管理費</span>
                  <span className="font-bold">{property.managementFee} 元</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-slate-400 mb-2">專業顧問</p>
                <p className="text-xl font-bold">{CONTACT_INFO.name}</p>
                <p className="text-sm text-slate-500">{CONTACT_INFO.company}</p>
              </div>

              <button className="w-full bg-accent text-white py-3 rounded-xl font-bold mb-3">
                立即聯絡
              </button>
              <button className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">
                加入收藏
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
