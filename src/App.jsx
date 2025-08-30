import { useState, useEffect } from "react";
import Login from "./login";
import Register from "./register";
import Verify from "./verify";
import Dashboard from "./dashboard";
import auctionIcon from "/images/auction.png";

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

const AuctionDropdown = ({ onSelectAuction, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const auctions = [
    { name: "Select Auction", id: 1 },
    { name: "IPL Auction", id: 2 },
    { name: "Movie Auction", id: 3 },
  ];

  const handleSelectAuction = (auction) => {
    if (auction.id !== 1) {
      setSelectedAuction(auction);
      if (!isLoggedIn) {
        alert("You are not logged in!");
      } else {
        onSelectAuction(auction);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="h-[calc(100vh-72px)] flex items-center justify-center bg-gray-100">
      <div className={`bg-white p-4 rounded-lg shadow-md transition-all duration-300 ${isOpen ? "pb-36" : ""}`}>
        <div className="flex justify-center px-2 py-2 h-15 font-bold text-2xl">
          Select Auction
        </div>
        <div className="relative w-64 font-bold">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2 flex items-center justify-between bg-white border rounded-md shadow-sm"
          >
            <span>{selectedAuction ? selectedAuction.name : "Select Auction"}</span>
            <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
          </button>
          {isOpen && (
            <div className="absolute w-full mt-1 bg-white border rounded-md">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [selectedAuction, setSelectedAuction] = useState(null);

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(storedLoginState);
  }, [currentPage]);

  useEffect(() => {
    const path = window.location.pathname.replace("/", "");
    if (["verify", "login", "register", "dashboard"].includes(path)) {
      setCurrentPage(path);
    } else {
      setCurrentPage("home");
    }
  }, []);

  useEffect(() => {
    const fetchUserStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setIsLoggedIn(true);
          localStorage.setItem("isLoggedIn", "true");
        } else {
          console.error("Failed to fetch user data:", data.error);
          setIsLoggedIn(false);
          localStorage.setItem("isLoggedIn", "false");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
      }
    };

    fetchUserStatus();
  }, [isLoggedIn]);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, "", `/${page}`);
  };

  const handleSelectAuction = (auction) => {
    if (isLoggedIn) {
      setSelectedAuction(auction);
      navigateTo("dashboard");
      console.log("success");
    } else {
      alert("You are not logged in!");
      console.log("failed");
    }
  };

  const handleLogin = (token) => {
    if (!token) {
      console.error("Login failed: No token received");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);  
    navigateTo("home");
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    navigateTo("login");
  };

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      <NavBar onNavigate={navigateTo} isLoggedIn={isLoggedIn} onLogout={handleLogout}/>
      {currentPage === "login" && (
        <Login onLogin={handleLogin} onNavigate={navigateTo} />
      )}
      {currentPage === "register" && <Register onNavigate={navigateTo} />}
      {currentPage === "verify" && <Verify onNavigate={navigateTo} />}
      {currentPage === "home" && (
        <AuctionDropdown onSelectAuction={handleSelectAuction} isLoggedIn={isLoggedIn} />
      )}
      {currentPage === "dashboard" &&
        (isLoggedIn ? (
          <Dashboard handleAuction={selectedAuction} isLoggedIn={isLoggedIn} />
        ) : (
          navigateTo("login")
        ))}
    </div>
  );
  
}