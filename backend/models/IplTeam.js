import mongoose from "mongoose";

const IplTeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    color: { type: String, default: "#3b82f6" }
});

const IplTeam = mongoose.model("IplTeam", IplTeamSchema);

export default IplTeam;
