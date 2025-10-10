// import { useEffect, useState, useMemo } from "react"; // ✅ ADDED (useMemo)
// import { listCompany } from "../../services/company";
// import { useNavigate } from "react-router-dom";
// import UseTitle from "../../hooks/useTitle";

// function Company() {
//   UseTitle("JobVip - Công ty");
//   const [companies, setCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;
//   const navigate = useNavigate();

//   // ✅ ADDED: state filter
//   const [selectedIndustry, setSelectedIndustry] = useState(""); // tên ngành
//   const [selectedAddress, setSelectedAddress] = useState("");   // chuỗi địa chỉ

//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await listCompany();
//       if (res.success) {
//         setCompanies(res.companys || []);
//       } else {
//         setError(res.message || "Không thể tải danh sách công ty.");
//       }
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   // ✅ ADDED: build options cho filter (từ data hiện có)
//   const { industryOptions, addressOptions } = useMemo(() => {
//     const industrySet = new Set();
//     const addressSet = new Set();

//     (companies || []).forEach((c) => {
//       // ngành
//       if (Array.isArray(c?.company_industry)) {
//         c.company_industry.forEach((ci) => {
//           const name = ci?.industry?.name;
//           if (name) industrySet.add(name);
//         });
//       }
//       // địa chỉ
//       if (Array.isArray(c?.address)) {
//         c.address.forEach((a) => {
//           const detail = a?.address_detail;
//           if (detail) addressSet.add(detail);
//         });
//       }
//     });

//     return {
//       industryOptions: Array.from(industrySet).sort(),
//       addressOptions: Array.from(addressSet).sort(),
//     };
//   }, [companies]);

//   // ✅ ADDED: áp dụng filter trước khi phân trang
//   const filteredCompanies = useMemo(() => {
//     let data = companies;

//     if (selectedIndustry) {
//       data = data.filter((c) =>
//         Array.isArray(c?.company_industry) &&
//         c.company_industry.some(
//           (ci) =>
//             (ci?.industry?.name || "")
//               .toLowerCase()
//               .includes(selectedIndustry.toLowerCase())
//         )
//       );
//     }

//     if (selectedAddress) {
//       data = data.filter((c) =>
//         Array.isArray(c?.address) &&
//         c.address.some((a) =>
//           (a?.address_detail || "")
//             .toLowerCase()
//             .includes(selectedAddress.toLowerCase())
//         )
//       );
//     }

//     return data;
//   }, [companies, selectedIndustry, selectedAddress]);

//   // ⬇️ Phân trang dùng danh sách đã lọc
//   const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage); // ✅ CHANGED (từ companies -> filteredCompanies)
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem); // ✅ CHANGED

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   // ✅ ADDED: khi đổi filter thì quay về trang 1
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedIndustry, selectedAddress]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-[70vh]">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="text-center text-red-500 text-lg font-medium mt-10">
//         {error}
//       </div>
//     );

//   if (companies.length === 0)
//     return (
//       <div className="text-center text-gray-500 text-lg mt-10">
//         Hiện chưa có công ty nào được đăng tải.
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* 🌈 Hiệu ứng nền + tiêu đề */}
//       <section className="relative bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 text-gray-800 py-20 overflow-hidden">
//         <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
//           <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
//         </div>

//         <div className="relative text-center">
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">
//             🌐 Danh sách công ty tuyển dụng
//           </h2>
//           <p className="text-gray-700 text-lg mt-4">
//             Khám phá các công ty đang tìm kiếm nhân tài như bạn
//           </p>
//         </div>
//       </section>

//       {/* ✅ ADDED: Thanh bộ lọc */}
//       <div className="max-w-7xl mx-auto px-4 mt-8">
//         <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm">
//           <div className="grid gap-4 md:grid-cols-3">
//             {/* Ngành nghề */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Lọc theo ngành nghề
//               </label>
//               <select
//                 value={selectedIndustry}
//                 onChange={(e) => setSelectedIndustry(e.target.value)}
//                 className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Tất cả ngành</option>
//                 {industryOptions.map((name) => (
//                   <option key={name} value={name}>
//                     {name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Địa chỉ */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Lọc theo địa chỉ
//               </label>
//               <select
//                 value={selectedAddress}
//                 onChange={(e) => setSelectedAddress(e.target.value)}
//                 className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="">Tất cả địa chỉ</option>
//                 {addressOptions.map((addr) => (
//                   <option key={addr} value={addr}>
//                     {addr}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Nút hành động */}
//             <div className="flex items-end gap-3">
//               <button
//                 onClick={() => {
//                   setSelectedIndustry("");
//                   setSelectedAddress("");
//                 }}
//                 className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
//               >
//                 Xóa bộ lọc
//               </button>
//               {/* Giữ chỗ cho tương lai (tìm kiếm tên công ty, v.v.) */}
//               {/* <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
//                 Áp dụng
//               </button> */}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 📋 Danh sách công ty */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//           {/** ⬇️ ĐỔI map để có thể khai báo biến trước khi return (không xoá logic cũ) */}
//           {currentCompanies.map((company) => {
//             // ✅ ADDED: Chuẩn hoá dữ liệu ngành nghề
//             const industries = Array.isArray(company?.company_industry)
//               ? company.company_industry
//                   .map((ci) => ci?.industry?.name)
//                   .filter(Boolean)
//               : [];

//             // ✅ ADDED: Chuẩn hoá dữ liệu địa chỉ
//             const addresses = Array.isArray(company?.address)
//               ? company.address
//                   .map((a) => a?.address_detail)
//                   .filter(Boolean)
//               : [];

//             return (
//               <div
//                 key={company.company_id}
//                 className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
//               >
//                 <div className="flex flex-col items-center text-center">
//                   <img
//                     src={
//                       company.logo_url ||
//                       "https://via.placeholder.com/120x120?text=No+Logo"
//                     }
//                     alt={company.name}
//                     className="w-24 h-24 object-contain mb-4 rounded-full bg-gray-100 p-2 group-hover:scale-110 transition-transform"
//                   />
//                   <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
//                     {company.name}
//                   </h3>

//                   <p className="text-sm text-gray-500 mt-2 line-clamp-3 h-16">
//                     {company.description || "Không có mô tả chi tiết."}
//                   </p>

//                   <div className="mt-4 text-sm text-gray-600 space-y-1">
//                     <p>
//                       <span className="font-medium text-gray-700">Quy mô:</span>{" "}
//                       {company.size}
//                     </p>

//                     {/* ✅ ADDED: Ngành nghề */}
//                     {industries.length > 0 && (
//                       <p>
//                         <span className="font-medium text-gray-700">Ngành:</span>{" "}
//                         {industries.join(", ")}
//                       </p>
//                     )}

//                     {/* ✅ ADDED: Địa chỉ (nếu nhiều địa chỉ sẽ nối bằng dấu •) */}
//                     {addresses.length > 0 && (
//                       <p className="line-clamp-2">
//                         <span className="font-medium text-gray-700">
//                           Địa chỉ:
//                         </span>{" "}
//                         {addresses.join(" • ")}
//                       </p>
//                     )}

//                     {/* (Giữ nguyên) Website */}
//                     {company.website && (
//                       <p>
//                         <span className="font-medium text-gray-700">
//                           Website:
//                         </span>{" "}
//                         <a
//                           href={company.website}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-500 hover:underline"
//                         >
//                           {company.website.replace(/^https?:\/\//, "")}
//                         </a>
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="mt-6">
//                   <button
//                     onClick={() => navigate(`/company/${company.company_id}`)}
//                     className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
//                   >
//                     Xem chi tiết
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* 🔢 Phân trang (giữ nguyên) */}
//         <div className="flex justify-center items-center gap-2 mt-10">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className={`px-4 py-2 rounded-lg border ${
//               currentPage === 1
//                 ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                 : "bg-white text-blue-600 hover:bg-blue-50"
//             }`}
//           >
//             Trước
//           </button>

//           {[...Array(totalPages)].map((_, i) => (
//             <button
//               key={i}
//               onClick={() => handlePageChange(i + 1)}
//               className={`px-3 py-2 rounded-lg ${
//                 currentPage === i + 1
//                   ? "bg-blue-600 text-white font-semibold"
//                   : "bg-white text-blue-600 border hover:bg-blue-50"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}

//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className={`px-4 py-2 rounded-lg border ${
//               currentPage === totalPages
//                 ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                 : "bg-white text-blue-600 hover:bg-blue-50"
//             }`}
//           >
//             Sau
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Company;



import { useEffect, useState, useMemo } from "react";
import { listCompany } from "../../services/company";
import { useNavigate } from "react-router-dom";
import UseTitle from "../../hooks/useTitle";

function Company() {
  UseTitle("JobVip - Công ty");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listCompany();
      if (res.success) {
        setCompanies(res.companys || []);
      } else {
        setError(res.message || "Không thể tải danh sách công ty.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const { industryOptions, addressOptions } = useMemo(() => {
    const industrySet = new Set();
    const addressSet = new Set();

    (companies || []).forEach((c) => {
      if (Array.isArray(c?.company_industry)) {
        c.company_industry.forEach((ci) => {
          const name = ci?.industry?.name;
          if (name) industrySet.add(name);
        });
      }
      if (Array.isArray(c?.address)) {
        c.address.forEach((a) => {
          const detail = a?.address_detail;
          if (detail) addressSet.add(detail);
        });
      }
    });

    return {
      industryOptions: Array.from(industrySet).sort(),
      addressOptions: Array.from(addressSet).sort(),
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let data = companies;

    if (selectedIndustry) {
      data = data.filter((c) =>
        Array.isArray(c?.company_industry) &&
        c.company_industry.some(
          (ci) =>
            (ci?.industry?.name || "")
              .toLowerCase()
              .includes(selectedIndustry.toLowerCase())
        )
      );
    }

    if (selectedAddress) {
      data = data.filter((c) =>
        Array.isArray(c?.address) &&
        c.address.some((a) =>
          (a?.address_detail || "")
            .toLowerCase()
            .includes(selectedAddress.toLowerCase())
        )
      );
    }

    return data;
  }, [companies, selectedIndustry, selectedAddress]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedIndustry, selectedAddress]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 text-lg font-medium mt-10">
        {error}
      </div>
    );

  if (companies.length === 0)
    return (
      <div className="text-center text-gray-500 text-lg mt-10">
        Hiện chưa có công ty nào được đăng tải.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative text-center max-w-7xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold drop-shadow-2xl mb-4">
            🌐 Danh sách công ty tuyển dụng
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Khám phá các công ty đang tìm kiếm nhân tài như bạn
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">🔍 Bộ lọc tìm kiếm</h3>
            <p className="text-sm text-gray-600 mt-1">Tìm kiếm công ty phù hợp với bạn</p>
          </div>
          
          <div className="p-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lọc theo ngành nghề
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium"
                >
                  <option value="">Tất cả ngành</option>
                  {industryOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lọc theo địa chỉ
                </label>
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium"
                >
                  <option value="">Tất cả địa chỉ</option>
                  {addressOptions.map((addr) => (
                    <option key={addr} value={addr}>
                      {addr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedIndustry("");
                    setSelectedAddress("");
                  }}
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentCompanies.map((company) => {
            const industries = Array.isArray(company?.company_industry)
              ? company.company_industry
                  .map((ci) => ci?.industry?.name)
                  .filter(Boolean)
              : [];

            const addresses = Array.isArray(company?.address)
              ? company.address
                  .map((a) => a?.address_detail)
                  .filter(Boolean)
              : [];

            return (
              <div
                key={company.company_id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Card Header with Gradient */}
                <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pb-8">
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <img
                        src={
                          company.logo_url ||
                          "https://via.placeholder.com/120x120?text=No+Logo"
                        }
                        alt={company.name}
                        className="relative w-24 h-24 object-contain rounded-2xl bg-white p-3 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 -mt-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {company.name}
                  </h3>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 h-16 mb-4">
                    {company.description || "Không có mô tả chi tiết."}
                  </p>

                  <div className="space-y-2.5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xs">👥</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Quy mô:</span> {company.size}
                      </div>
                    </div>

                    {industries.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold text-xs">💼</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">Ngành:</span>{" "}
                          <span className="line-clamp-2">{industries.join(", ")}</span>
                        </div>
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold text-xs">📍</span>
                        </div>
                        <div className="flex-1 line-clamp-2">
                          <span className="font-semibold text-gray-800">Địa chỉ:</span>{" "}
                          {addresses.join(" • ")}
                        </div>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 font-bold text-xs">🌐</span>
                        </div>
                        <div className="flex-1 truncate">
                          <span className="font-semibold text-gray-800">Website:</span>{" "}
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate(`/company/${company.company_id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md hover:shadow-lg"
            }`}
          >
            ← Trước
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-12 h-12 rounded-xl font-bold transition-all ${
                currentPage === i + 1
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md hover:shadow-lg"
            }`}
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Company;