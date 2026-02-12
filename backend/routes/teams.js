import express from "express";
import verifyToken from "../middleware/auth.js";
import IplTeam from "../models/IplTeam.js";
import MovieTeam from "../models/MovieTeam.js";

const router = express.Router();

// Mock data fallback when DB is empty
const MOCK_IPL_TEAMS = [
    { _id: "mock1", name: "Mumbai Indians", shortName: "MI", color: "#004BA0" },
    { _id: "mock2", name: "Chennai Super Kings", shortName: "CSK", color: "#F9CD05" },
    { _id: "mock3", name: "Royal Challengers Bengaluru", shortName: "RCB", color: "#D4213D" },
    { _id: "mock4", name: "Kolkata Knight Riders", shortName: "KKR", color: "#3A225D" },
    { _id: "mock5", name: "Delhi Capitals", shortName: "DC", color: "#17479E" },
    { _id: "mock6", name: "Rajasthan Royals", shortName: "RR", color: "#EA1A85" },
    { _id: "mock7", name: "Sunrisers Hyderabad", shortName: "SRH", color: "#F26522" },
    { _id: "mock8", name: "Punjab Kings", shortName: "PBKS", color: "#ED1B24" },
    { _id: "mock9", name: "Gujarat Titans", shortName: "GT", color: "#1C1C2B" },
    { _id: "mock10", name: "Lucknow Super Giants", shortName: "LSG", color: "#A72056" },
];

const MOCK_MOVIE_TEAMS = [
    { _id: "mock1", name: "Action Heroes", genre: "Action", color: "#DC2626" },
    { _id: "mock2", name: "Comedy Kings", genre: "Comedy", color: "#F59E0B" },
    { _id: "mock3", name: "Drama Stars", genre: "Drama", color: "#7C3AED" },
    { _id: "mock4", name: "Thriller Squad", genre: "Thriller", color: "#1F2937" },
    { _id: "mock5", name: "Sci-Fi Legends", genre: "Sci-Fi", color: "#0EA5E9" },
    { _id: "mock6", name: "Horror House", genre: "Horror", color: "#991B1B" },
];

router.get("/auctions/:id/teams", verifyToken, async (req, res) => {
    try {
        const auctionId = parseInt(req.params.id);

        let teams = [];

        if (auctionId === 2) {
            // IPL Auction
            teams = await IplTeam.find({});
            if (teams.length === 0) teams = MOCK_IPL_TEAMS;
        } else if (auctionId === 3) {
            // Movie Auction
            teams = await MovieTeam.find({});
            if (teams.length === 0) teams = MOCK_MOVIE_TEAMS;
        } else {
            return res.status(404).json({ error: "Auction not found" });
        }

        res.json({ teams, auctionId });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
