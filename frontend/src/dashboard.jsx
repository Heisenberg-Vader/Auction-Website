import React, { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { FiHome } from "react-icons/fi";
import { FiBarChart2 } from "react-icons/fi";
import { FiSettings } from "react-icons/fi";
import TeamCard from "./TeamCard";
import { API_URL } from "./App";

const Dashboard = ({ handleAuction, isLoggedIn }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState(null);

  useEffect(() => {
    if (!handleAuction || !isLoggedIn) return;

    const fetchTeams = async () => {
      setTeamsLoading(true);
      setTeamsError(null);
      try {
        const response = await fetch(
          `${API_URL}/api/auctions/${handleAuction.id}/teams`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }

        const data = await response.json();
        setTeams(data.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeamsError("Could not load teams. Please try again.");
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, [handleAuction, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex justify-center items-center text-xl">
        Please log in.
      </div>
    );
  }

  const auctionType = handleAuction?.id === 2 ? "ipl" : "movie";

  return (
    <div className="relative h-[calc(100vh-72px)] bg-gray-100 flex">
      <aside
        className={`
          fixed top-[72px] left-0 h-[calc(100vh-72px)] bg-black text-white 
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

      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-500 ${isSidebarOpen ? "ml-60" : "ml-24"}`}>
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard!</h1>
        {handleAuction && (
          <p className="text-gray-500 mb-6 text-sm">
            Currently viewing: <span className="font-semibold text-gray-700">{handleAuction.name}</span>
          </p>
        )}

        {selectedTab === "overview" && (
          <div>
            {teamsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : teamsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-medium">{teamsError}</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg">No teams found for this auction.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team) => (
                  <TeamCard
                    key={team._id}
                    team={team}
                    auctionType={auctionType}
                  />
                ))}
              </div>
            )}
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
