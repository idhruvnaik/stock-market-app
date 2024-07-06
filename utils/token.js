const jwt = require("jsonwebtoken");

const generateAccessToken = async(user) => {
    try {
        const payload = { unique_token: user?.unique_token };
        
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: '10m'}
        );

        return Promise.resolve({ accessToken });
    } catch(err) {
        return Promise.reject(err);
    }
};

const generateRefreshToken = async(user) => {
    try {
        const payload = { unique_token: user?.unique_token };
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: "30d" }
        );

        return Promise.resolve({ refreshToken });
    } catch(err) {
        return Promise.reject(err);
    }
};

const verifyAccessToken = async(accessToken) => {
    const privateKey = process.env.ACCESS_TOKEN_PRIVATE_KEY;

    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, privateKey, (err, tokenDetails) => {
            if (err)
                return reject({ code: 401, error: true, message: "Invalid access token" });
            resolve({
                tokenDetails,
                error: false,
                message: "Valid access token",
            });
        });
    });
};

const verifyRefreshToken = async(refreshToken) => {
    const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;

    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
            if (err)
                return reject({ code: 401, error: true, message: "Invalid refresh token" });
            resolve({
                tokenDetails,
                error: false,
                message: "Valid refresh token",
            });
        });
    });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };