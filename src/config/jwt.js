import jwt from 'jsonwebtoken';

export const createToken = (data) => {
    return jwt.sign({data}, "secret", {algorithm: "HS256", expiresIn: "10m"});
}

export const checkToken = (token) => jwt.verify(token, "secret", (error, decoded) => error
);

// use for logging in again
export const createRefToken = (data) => {
    return jwt.sign({ data }, "not_secret", { algorithm: "HS256", expiresIn: "1d" });
}

export const checkRefToken = (token) => jwt.verify(token, "not_secret", (error, decoded) => error
);

export const decodeToken = (token) => {
    return jwt.decode(token);
}

export const verifyToken = (req, res, next) => {

    let { token } = req.headers;

    let check = checkToken(token);

    if (check == null) {
        // check token valid
        next()
    } else {
        // token not valid
        res.status(401).send(check.name)
    }
}