import React from "react";

const TeamCard = ({ team, auctionType }) => {
    const accentColor = team.color || "#3b82f6";

    return (
        <div
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 
                 hover:-translate-y-1 overflow-hidden cursor-default"
        >
            <div className="flex">
                {/* Accent bar */}
                <div
                    className="w-1.5 flex-shrink-0 rounded-l-2xl"
                    style={{ backgroundColor: accentColor }}
                />
                <div className="flex-1 p-5">
                    <h3 className="text-lg font-bold text-gray-900 text-center">
                        {team.name}
                    </h3>
                    {/* IPL: show short name | Movie: show genre */}
                    <p className="text-sm text-gray-500 text-center mt-1">
                        {auctionType === "ipl" ? team.shortName : team.genre}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
