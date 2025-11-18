interface LaptopCardProps {
  laptop: {
    laptopId: string;
    brand?: string;
    status?: string;
    laptopModel?: string;
    handler?: string;
    laptopSn?: string;
    headsetBrand?: string;
    headsetModel?: string;
    mouseBrand?: string;
    mouseModel?: string;
    chargerBrand?: string;
    chargerModel?: string;
  };
}

export default function LaptopCard({ laptop }: LaptopCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-gray-100 text-gray-700";
      case "Temporary":
        return "bg-yellow-100 text-yellow-700";
      case "Vacant":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-purple-300 transition-all duration-200">
      {/* Laptop Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 mb-1">
            {laptop.laptopId}
          </h4>
          <p className="text-xs text-gray-500">{laptop.brand || "N/A"}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            laptop.status
          )}`}
        >
          {laptop.status || "N/A"}
        </span>
      </div>

      {/* Model & Owner */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-1">
          {laptop.laptopModel || "No Model"}
        </p>
        <p className="text-xs text-gray-500 mb-1">
          Owner: {laptop.handler || "N/A"}
        </p>
        <p className="text-xs text-gray-400 font-mono">
          SN: {laptop.laptopSn || "N/A"}
        </p>
      </div>

      {/* Accessories */}
      <div className="space-y-2">
        {/* Headset */}
        <div className="flex items-start text-xs">
          <span className="text-gray-400 mr-2">🎧</span>
          <div className="flex-1">
            <span className="text-gray-600">
              {laptop.headsetBrand && laptop.headsetModel
                ? `${laptop.headsetBrand} ${laptop.headsetModel}`
                : laptop.headsetBrand || laptop.headsetModel || "No Headset"}
            </span>
          </div>
        </div>

        {/* Mouse */}
        <div className="flex items-start text-xs">
          <span className="text-gray-400 mr-2">🖱️</span>
          <div className="flex-1">
            <span className="text-gray-600">
              {laptop.mouseBrand && laptop.mouseModel
                ? `${laptop.mouseBrand} ${laptop.mouseModel}`
                : laptop.mouseBrand || laptop.mouseModel || "No Mouse"}
            </span>
          </div>
        </div>

        {/* Charger */}
        <div className="flex items-start text-xs">
          <span className="text-gray-400 mr-2">🔌</span>
          <div className="flex-1">
            <span className="text-gray-600">
              {laptop.chargerBrand && laptop.chargerModel
                ? `${laptop.chargerBrand} ${laptop.chargerModel}`
                : laptop.chargerBrand || laptop.chargerModel || "No Charger"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

