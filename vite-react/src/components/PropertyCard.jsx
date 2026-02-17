import React from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizePrice, formatPrice } from "@/lib/constants";

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

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
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all cursor-pointer"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <img
        src={property.images?.[0] || ""}
        className="w-full h-64 object-cover"
        alt={property.title}
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl">{property.title}</h3>
          <span className="text-accent font-black text-lg">
            <PriceDisplay price={property.price} />
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
          <MapPin size={14} /> {property.address}
        </p>
        <div className="flex justify-between border-t pt-4 text-sm font-bold text-primary">
          <span>{property.area} 坪</span>
          <span>{property.rooms} 房</span>
          <span className="text-slate-400">👀 {property.viewCount}</span>
        </div>
      </div>
    </div>
  );
}
