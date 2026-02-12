import { useState, useEffect, lazy, Suspense } from "react";
import auctionIcon from "/images/auction.png";
import { ToastContainer, useToast } from "./Toast";

const Login = lazy(() => import("./login"));
const Register = lazy(() => import("./register"));
const Verify = lazy(() => import("./verify"));
const Dashboard = lazy(() => import("./dashboard"));

const API_URL = "https://localhost:5000";

const NavBar = ({ onNavigate, isLoggedIn, onLogout }) => {
  return (
    <div className="flex justify-between items-center bg-black text-white text-3xl font-bold p-5 px-8">
      <div
        className="flex items-center space-x-4 cursor-pointer"
        onClick={() => onNavigate("home")}
      >
        <img src={auctionIcon} className="w-8 h-8" alt="Auction Hammer" />
        <h1 className="text-2xl">Auction</h1>
      </div>
      <div>
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="relative text-lg group cursor-pointer"
          >
            <span className="relative">Logout</span>
            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-white scale-x-0 transform 
            origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate("login")}
            className="relative text-lg group cursor-pointer"
          >
            <span className="relative">Login</span>
            <span className="absolute left-0 bottom-0 h-[2px] w-full bg-white scale-x-0 transform 
            origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
          </button>
        )}
      </div>
    </div>
  );
};

const AuctionDropdown = ({ onSelectAuction, isLoggedIn, showToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const auctions = [
    { name: "Select Auction", id: 1 },
    { name: "IPL Auction", id: 2 },
    { name: "Movie Auction", id: 3 },
  ];

  const handleSelectAuction = (auction) => {
    if (auction.id !== 1) {
      setSelectedAuction(auction);
    }
    setIsOpen(false);
  };

  const handleGoToAuction = () => {
    if (!selectedAuction) {
      showToast("Please select an auction first!", "warning");
      return;
    }
    if (!isLoggedIn) {
      showToast("You are not logged in!", "error");
      return;
    }
    onSelectAuction(selectedAuction);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="h-[calc(100vh-72px)] flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f3f4f6 0%, #dbeafe 50%, #e0e7ff 100%)" }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.06) 40%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md transition-all duration-300 w-72">
        <div className="flex justify-center px-2 py-2 font-bold text-2xl">
          Select Auction
        </div>
        <div className="w-full font-bold">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2 flex items-center justify-between bg-white border rounded-md shadow-sm"
          >
            <span>{selectedAuction ? selectedAuction.name : "Select Auction"}</span>
            <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60" : "max-h-0"}`}>
            <div className="mt-1 bg-white border rounded-md">
              {auctions.map((auction) => (
                <div
                  key={auction.id}
                  className="p-2 hover:bg-gray-100 border-none rounded-md cursor-pointer"
                  onClick={() => handleSelectAuction(auction)}
                >
                  {auction.name}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleGoToAuction}
          className="w-full mt-4 py-2 px-4 rounded-md font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300 cursor-pointer shadow-sm"
        >
          Go to Auction →
        </button>
      </div>
    </div>
  );
};

const fetchCsrfToken = async () => {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      credentials: "include"
    });
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    return null;
  }
};

export { API_URL, fetchCsrfToken };

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const { toast, showToast, removeToast } = useToast();

  useEffect(() => {
    const path = window.location.pathname.replace("/", "");
    const loggedInRoutes = ["home", "dashboard", "verify"];
    const publicRoutes = ["login", "register"];

    if (isLoggedIn && loggedInRoutes.includes(path)) {
      setCurrentPage(path);
    } else if (!isLoggedIn && publicRoutes.includes(path)) {
      setCurrentPage(path);
    } else {
      setCurrentPage("home");
      window.history.replaceState({}, "", "/");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/me`, {
          method: "GET",
          credentials: "include"
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
      }
    };

    fetchUserStatus();
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, "", `/${page}`);
  };

  const handleSelectAuction = (auction) => {
    if (isLoggedIn) {
      setSelectedAuction(auction);
      navigateTo("dashboard");
    } else {
      showToast("You are not logged in!", "error");
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigateTo("home");
  };

  const handleLogout = async () => {
    try {
      const csrfToken = await fetchCsrfToken();
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsLoggedIn(false);
    navigateTo("login");
  };

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      <ToastContainer toast={toast} removeToast={removeToast} />
      <NavBar onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Suspense fallback={
        <div className="h-[calc(100vh-72px)] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        {currentPage === "login" && (
          <Login onLogin={handleLogin} onNavigate={navigateTo} showToast={showToast} />
        )}
        {currentPage === "register" && <Register onNavigate={navigateTo} showToast={showToast} />}
        {currentPage === "verify" && <Verify onNavigate={navigateTo} />}
        {currentPage === "home" && (
          <AuctionDropdown onSelectAuction={handleSelectAuction} isLoggedIn={isLoggedIn} showToast={showToast} />
        )}
        {currentPage === "dashboard" &&
          (isLoggedIn ? (
            <Dashboard handleAuction={selectedAuction} isLoggedIn={isLoggedIn} />
          ) : (
            navigateTo("login")
          ))}
      </Suspense>
    </div>
  );
}