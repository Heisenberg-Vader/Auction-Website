import React, { useState } from "react";
import { FiMenu, FiX, FiHome, FiBarChart2, FiSettings } from "react-icons/fi";

const Dashboard = ({ handleAuction, isLoggedIn }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Please log in.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 pt-14 flex transition-all duration-300">
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-3rem)] bg-black text-white 
          transition-all duration-500 delay-200 flex flex-col p-4
          ${isSidebarOpen ? "w-60" : "w-20"}
        `}
      >
        <div className="flex items-center justify-between mb-6">
          {isSidebarOpen && (
            <button className="text-white" onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          )}

          {!isSidebarOpen && (
            <button className="text-white ml-3" onClick={() => setIsSidebarOpen(true)}>
              <FiMenu size={24} />
            </button>
          )}
        </div>

        <nav className="space-y-4">
          <button
            className={`flex items-center px-4 py-2 w-full text-lg transition-all duration-300 ${selectedTab === "overview" ? "bg-gray-700 rounded-lg" : ""
              }`}
            onClick={() => setSelectedTab("overview")}
          >
            <FiHome size={20} />
            <span
              className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? "ml-3 opacity-100 w-auto" : "ml-0 opacity-0 w-0"
                }`}
            >
              Overview
            </span>
          </button>

          <button
            className={`flex items-center px-4 py-2 w-full text-lg transition-all duration-300 ${selectedTab === "bids" ? "bg-gray-700 rounded-lg" : ""
              }`}
            onClick={() => setSelectedTab("bids")}
          >
            <FiBarChart2 size={20} />
            <span
              className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? "ml-3 opacity-100 w-auto" : "ml-0 opacity-0 w-0"
                }`}
            >
              My Bids
            </span>
          </button>

          <button
            className={`flex items-center px-4 py-2 w-full text-lg transition-all duration-300 ${selectedTab === "settings" ? "bg-gray-700 rounded-lg" : ""
              }`}
            onClick={() => setSelectedTab("settings")}
          >
            <FiSettings size={20} />
            <span
              className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? "ml-3 opacity-100 w-auto" : "ml-0 opacity-0 w-0"
                }`}
            >
              Settings
            </span>
          </button>
        </nav>
      </aside>

      <main className={`p-8 transition-all duration-500 ${isSidebarOpen ? "ml-60" : "ml-24"}`}>
        <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard!</h1>

        {selectedTab === "overview" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Auction Overview</h2>
            <p className="text-gray-600 mt-2">
              {handleAuction ? `Current Auction: ${handleAuction.name}` : "No auction selected"}
            </p>
          </div>
        )}

        {selectedTab === "bids" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Your Bids</h2>
            <p className="text-gray-600 mt-2">List of all bids you have placed.</p>
          </div>
        )}

        {selectedTab === "settings" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Settings</h2>
            <p className="text-gray-600 mt-2">User preferences will be added soon!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
