import crypto from "crypto";

const generateCsrfToken = (req, res) => {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrfToken", token, {
        httpOnly: false,
        sameSite: "strict",
        secure: true,
        maxAge: 60 * 60 * 1000
    });
    res.json({ csrfToken: token });
};

const validateCsrf = (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const headerToken = req.headers["x-csrf-token"];
    const cookieToken = req.cookies?.csrfToken;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        return res.status(403).json({ error: "CSRF validation failed" });
    }

    next();
};

export { generateCsrfToken, validateCsrf };
