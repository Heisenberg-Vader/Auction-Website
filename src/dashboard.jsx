/* NOT FINAL YET, SUBJECT TO EDITS
this looks a little weird, would like to change design a bit */

import React, { useState } from "react";
import { FiHome, FiSettings, FiLogOut, FiBarChart2 } from "react-icons/fi";

const Dashboard = ({ handleAuction, isLoggedIn, onLogout }) => {
  const [selectedTab, setSelectedTab] = useState("overview");

  if (!isLoggedIn) {
    return <div className="h-screen flex justify-center items-center text-xl">Please log in.</div>;
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-5 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
        <nav className="flex-1 space-y-4">
          <button
            className={`flex items-center space-x-3 px-4 py-2 w-full text-lg ${
              selectedTab === "overview" ? "bg-gray-700 rounded-lg" : ""
            }`}
            onClick={() => setSelectedTab("overview")}
          >
            <FiHome size={20} />
            <span>Overview</span>
          </button>
          <button
            className={`flex items-center space-x-3 px-4 py-2 w-full text-lg ${
              selectedTab === "bids" ? "bg-gray-700 rounded-lg" : ""
            }`}
            onClick={() => setSelectedTab("bids")}
          >
            <FiBarChart2 size={20} />
            <span>My Bids</span>
          </button>
          <button
            className={`flex items-center space-x-3 px-4 py-2 w-full text-lg ${
              selectedTab === "settings" ? "bg-gray-700 rounded-lg" : ""
            }`}
            onClick={() => setSelectedTab("settings")}
          >
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
        </nav>
        <button
          className="mt-auto flex items-center space-x-3 px-4 py-2 text-lg bg-red-500 hover:bg-red-600 rounded-lg"
          onClick={onLogout}
        >
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>

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
            <p className="text-gray-600 mt-2">// Will add settings for users 🥰</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
