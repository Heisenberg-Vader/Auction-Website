import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "somekey";

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No session found" });
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.clearCookie("token");
        return res.status(401).json({ error: "Invalid or expired session" });
    }
};

export { jwtSecret };
export default verifyToken;
