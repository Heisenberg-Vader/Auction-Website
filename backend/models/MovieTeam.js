import mongoose from "mongoose";

const MovieTeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genre: { type: String, required: true },
    color: { type: String, default: "#8b5cf6" }
});

const MovieTeam = mongoose.model("MovieTeam", MovieTeamSchema);

export default MovieTeam;
