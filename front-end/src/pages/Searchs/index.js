import React, { useState, useEffect } from "react";
const Searchs = () => {
  const [searchData, setSearchData] = useState({
    keywords: "",
    location: "",
    distance: "",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", searchData);
  };
  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };
  const clearAllFilters = () => {
    setActiveFilters({
      workType: [],
      salary: [],
      experience: [],
      industry: [],
    });
    setSearchData({
      keywords: "",
      location: "",
      distance: "",
    });
    setCurrentPage(1);
  };

  return (
    <>
      {/* ///////////////////////////////////////// */}
      <section className="relative bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 py-16 overflow-hidden">
        {/* Background patterns and blobs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Tìm kiếm công việc mơ ước
          </h1>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="keywords"
                  placeholder="Từ khóa/chức danh"
                  value={searchData.keywords}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="location"
                  placeholder="Địa điểm"
                  value={searchData.location}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <select
                  name="distance"
                  value={searchData.distance}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-300 hover:border-blue-400"
                >
                  <option value="">Khoảng cách123</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold transform hover:scale-105 shadow-xl hover:shadow-2xl group backdrop-blur-sm"
              >
                <span className="flex items-center justify-center">
                  Tìm kiếm
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* ///////////////////////////// */}
    </>
  );
};

export default Searchs;
