import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, FileText, ChevronDown } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra thông tin user từ localStorage khi component mount
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error("Error parsing user info:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    // Xóa thông tin đăng nhập khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="h-10 w-32 bg-blue-500 rounded flex items-center justify-center hover:bg-blue-400 transition-colors">
              <span className="text-white font-bold text-lg">JobVip</span>
            </div>
          </div>

          {/* Thanh tìm kiếm và Điều hướng */}
          <div className="hidden md:flex items-center flex-grow mx-8">
            {/* Thanh tìm kiếm */}
            <div className="flex-grow max-w-2xl">
              <input
                type="text"
                placeholder="Tìm kiếm việc làm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Menu máy tính */}
            <nav className="ml-8 flex space-x-6">
              <a
                href="/"
                className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300"
              >
                Trang Chủ
              </a>
              <a
                href="/company"
                className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300"
              >
                Công Ty
              </a>
              <a
                href="/job"
                className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300"
              >
                Việc làm
              </a>
            </nav>
          </div>

          {/* Phần bên phải - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // Hiển thị khi đã đăng nhập
              <>
                {/* Nút Đã ứng tuyển */}
                <a
                  href="/applications"
                  className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300"
                >
                  Đã ứng tuyển
                </a>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-white hover:text-blue-200 px-3 py-2 rounded-md transition-colors"
                  >
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.fullName || user.email}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <a
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Thông tin cá nhân
                      </a>
                      
                      <a 
                        href="/cv" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FileText className="h-4 w-4 mr-3" />
                        CV của tôi
                      </a>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Hiển thị khi chưa đăng nhập
              <>
                <a
                  href="/applications"
                  className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300"
                >
                  Đã ứng tuyển
                </a>
                <button
                  onClick={() => navigate("/login")}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Đăng Nhập
                </button>
              </>
            )}
          </div>

          {/* Nút menu điện thoại */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-blue-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu điện thoại */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700 rounded-lg mt-2">
              {/* Thanh tìm kiếm điện thoại */}
              <div className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm việc làm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <a
                href="/"
                className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium"
              >
                Trang Chủ
              </a>
              <a
                href="/company"
                className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium"
              >
                Công Ty
              </a>
              <a
                href="/job"
                className="text-white hover:text-blue-200 block px-3 py-2 rounded-md text-base font-medium"
              >
                Việc làm
              </a>

              {/* Phần user - Mobile */}
              <div className="pt-4 pb-3 border-t border-blue-500">
                {user ? (
                  // Đã đăng nhập - Mobile
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-blue-600 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {user.fullName || "User"}
                          </p>
                          <p className="text-blue-200 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <a
                      href="/profile"
                      className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-base font-medium flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Thông tin cá nhân
                    </a>

                    <a
                      href="/applications"
                      className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-base font-medium flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Đã ứng tuyển
                    </a>

                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium flex items-center justify-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  // Chưa đăng nhập - Mobile
                  <div className="flex flex-col space-y-2">
                    <a
                      href="/applications"
                      className="text-white hover:text-blue-200 px-3 py-2 text-base font-medium"
                    >
                      Đã ứng tuyển
                    </a>
                    <button
                      onClick={() => navigate("/login")}
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium"
                    >
                      Đăng Nhập
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
