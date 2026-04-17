import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "restaurant_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "restaurant_refresh_secret";

export const createToken = (payload, expiresIn = "1d") => {
    return jwt.sign(payload, ACCESS_SECRET, {
        algorithm: "HS256",
        expiresIn,
    });
};

export const checkToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_SECRET);
    } catch (error) {
        return null;
    }
};

export const createRefToken = (payload, expiresIn = "7d") => {
    return jwt.sign(payload, REFRESH_SECRET, {
        algorithm: "HS256",
        expiresIn,
    });
};

export const checkRefToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

export const decodeToken = (token) => {
    return jwt.decode(token);
};