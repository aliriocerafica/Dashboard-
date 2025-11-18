"use client";

import {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import LaptopCard from "@/app/components/cards/LaptopCard";
import LaptopCardSkeleton from "@/app/components/skeletons/LaptopCardSkeleton";
import EmptyState from "@/app/components/EmptyState";
import { exportLaptopsToCSV } from "@/app/lib/exportUtils";
import { fetchWithCache, dataCache } from "@/app/lib/cache";
import {
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface LaptopInventoryData {
  summary: {
    totalLaptops: number;
    activeLaptops: number;
    inactiveLaptops: number;
    temporaryLaptops: number;
    vacantLaptops: number;
  };
  laptops: any[];
}

function LaptopInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [laptopData, setLaptopData] = useState<LaptopInventoryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states - Initialize from URL params
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get("status") || "all"
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    searchParams.get("brand") || "all"
  );
  const [selectedRam, setSelectedRam] = useState<string>(
    searchParams.get("ram") || "all"
  );

  // Infinite scroll state
  const [displayLimit, setDisplayLimit] = useState(12);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLaptopData();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (selectedBrand !== "all") params.set("brand", selectedBrand);
    if (selectedRam !== "all") params.set("ram", selectedRam);

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [searchTerm, selectedStatus, selectedBrand, selectedRam]);

  const loadLaptopData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Clear cache if force refresh
      if (forceRefresh) {
        dataCache.clear("laptop-inventory");
      }

      // Use cache with 5 minute TTL
      const result = await fetchWithCache<any>(
        `/api/get-laptop-inventory?timestamp=${Date.now()}`,
        { cache: "no-store" },
        "laptop-inventory",
        5 * 60 * 1000 // 5 minutes
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to load laptop inventory");
      }

      setLaptopData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load laptop inventory"
      );
      console.error("Error loading laptop inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLaptopData(true); // Force refresh bypasses cache
  };

  // Get unique values for filters
  const uniqueBrands = Array.from(
    new Set(laptopData?.laptops.map((l: any) => l.brand).filter(Boolean))
  ).sort();

  const uniqueRams = Array.from(
    new Set(laptopData?.laptops.map((l: any) => l.ram).filter(Boolean))
  ).sort();

  // Memoize filtered laptops to prevent unnecessary recalculations
  const filteredLaptops = useMemo(() => {
    if (!laptopData?.laptops) return [];

    const searchLower = searchTerm.toLowerCase();

    return laptopData.laptops.filter((laptop: any) => {
      // Search filter - optimized with early returns
      if (searchTerm) {
        const matchesSearch =
          laptop.laptopId?.toLowerCase().includes(searchLower) ||
          laptop.brand?.toLowerCase().includes(searchLower) ||
          laptop.laptopModel?.toLowerCase().includes(searchLower) ||
          laptop.handler?.toLowerCase().includes(searchLower) ||
          laptop.status?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus !== "all" && laptop.status !== selectedStatus) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== "all" && laptop.brand !== selectedBrand) {
        return false;
      }

      // RAM filter
      if (selectedRam !== "all" && laptop.ram !== selectedRam) {
        return false;
      }

      return true;
    });
  }, [
    laptopData?.laptops,
    searchTerm,
    selectedStatus,
    selectedBrand,
    selectedRam,
  ]);

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(12);
  }, [searchTerm, selectedStatus, selectedBrand, selectedRam]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setDisplayLimit((prev) => prev + 12);
    }
  }, []);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to IT Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ComputerDesktopIcon className="w-10 h-10 text-purple-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Laptop Inventory
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete inventory of all company laptops and accessories
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  filteredLaptops && exportLaptopsToCSV(filteredLaptops)
                }
                disabled={!laptopData || filteredLaptops?.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && !laptopData && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && laptopData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Total Laptops
                  </span>
                </div>
                <p className="text-3xl font-bold">
                  {laptopData.summary.totalLaptops}
                </p>
              </div>

              <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Active</span>
                </div>
                <p className="text-3xl font-bold">
                  {laptopData.summary.activeLaptops}
                </p>
              </div>

              <div className="bg-linear-to-br from-gray-500 to-gray-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Inactive
                  </span>
                </div>
                <p className="text-3xl font-bold">
                  {laptopData.summary.inactiveLaptops}
                </p>
              </div>

              <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Temporary
                  </span>
                </div>
                <p className="text-3xl font-bold">
                  {laptopData.summary.temporaryLaptops}
                </p>
              </div>

              <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Vacant</span>
                </div>
                <p className="text-3xl font-bold">
                  {laptopData.summary.vacantLaptops}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by laptop ID, brand, model, owner, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Filters
                    </h3>
                    {(selectedStatus !== "all" ||
                      selectedBrand !== "all" ||
                      selectedRam !== "all") && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {[
                          selectedStatus !== "all" ? 1 : 0,
                          selectedBrand !== "all" ? 1 : 0,
                          selectedRam !== "all" ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}{" "}
                        active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedBrand("all");
                      setSelectedRam("all");
                    }}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Vacant">Vacant</option>
                    </select>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Brands</option>
                      {uniqueBrands.map((brand: any) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* RAM Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      RAM Specs
                    </label>
                    <select
                      value={selectedRam}
                      onChange={(e) => setSelectedRam(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All RAM</option>
                      {uniqueRams.map((ram: any) => (
                        <option key={ram} value={ram}>
                          {ram}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                {filteredLaptops?.length || 0} of {laptopData.laptops.length}{" "}
                laptops match your filters
              </p>
            </div>

            {/* Laptop Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  All Laptops & Accessories
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredLaptops?.length || 0} laptops
                </span>
              </div>

              {/* Loading Skeletons */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <LaptopCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Laptop Cards */}
              {!loading && filteredLaptops && filteredLaptops.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredLaptops
                      .slice(0, displayLimit)
                      .map((laptop: any, index: number) => {
                        // Create unique key combining laptopId, serial number, and index
                        const uniqueKey = `${laptop.laptopId || "unknown"}-${
                          laptop.laptopSn || "no-sn"
                        }-${index}`;
                        return <LaptopCard key={uniqueKey} laptop={laptop} />;
                      })}
                  </div>
                  {/* Loading sentinel */}
                  {filteredLaptops.length > displayLimit && (
                    <div
                      ref={loaderRef}
                      className="flex justify-center py-8 w-full"
                    >
                      <LoadingSpinner size="sm" text="Loading more..." />
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!loading && filteredLaptops?.length === 0 && (
                <EmptyState
                  icon={<ComputerDesktopIcon className="w-16 h-16" />}
                  title="No laptops found"
                  description="Try adjusting your search or filters to find what you're looking for."
                  action={
                    (selectedStatus !== "all" ||
                      selectedBrand !== "all" ||
                      selectedRam !== "all" ||
                      searchTerm) && (
                      <button
                        onClick={() => {
                          setSelectedStatus("all");
                          setSelectedBrand("all");
                          setSelectedRam("all");
                          setSearchTerm("");
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )
                  }
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LaptopInventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <LaptopInventoryContent />
    </Suspense>
  );
}
