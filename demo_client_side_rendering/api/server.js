const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { base64url } = require('./helpers');

const app = express();
const port = 3000;
const jwtSecret = 'jIyM2d7HEQXMz4GYP0dyXmONGC0cToTs/ESKs9n+NZen3TAzzr07aK6QDhazzUNvhQa3mGvxn8iurNpgGXt3Js2O/LEJ8HCKtvRXs1wrZ4/Z0oE9FklHvBmjgJZZSuoC1KuaYIDTLDHsrOJlA2fgZsNJQRqnTCzbLz4qN2sYETgoat7b3mw6oBnAFWc5+0PIz352DfO/0LW+6/keZH2CZFrNAuzhUkFsKzVtZDhytWhX7hrdnC6PNTcIB6XWkH/BHhzvUqnHFyTVRRdwZT6clWz/sTgt1hZO9fQcChrSv+pobPR9Njz32d9NKkA7VtM21gzs1HVwK6qesbyvs6XGLA==';

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fake DB (Mysql, MongoDB, ...)
const db = {
    users: [
        { 
            id: 1, 
            name: "Nguyen Van A",
            email: "nguyenvana@gmail.com", 
            password: "123456",  // ⛔ Never store password in plain text ✔️ Hash password (bcrypt, md5, sha256, ...)
        },
    ],
    posts: [
        { 
            id: 1, 
            title: "Post 1", 
            description: "Description 1",
        },
        {
            id: 2,
            title: "Post 2",
            description: "Description 2",
        },
        {
            id: 3,
            title: "Post 3",
            description: "Description 3",
        }
    ],
};

// Session (JWT, Cookie, Session)
// const sessions = {};

// [GET] /api/posts
app.get('/api/posts', (req, res) => {
    res.json(db.posts);
});


// [POST] /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(401)
            .json({ 
                message: "Unauthorized", 
            });
    }

    // Tạo token JWT
    const header = {
        alg: "HS256",
        typ: "JWT",
    };
    const payload = {
        sub: user.id,
        exp: Date.now() + 3600000, // 1 hour
    };

    // Mã hoá base64(json(header + payload))
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));

    // Tạo token data <header>.<payload>
    const tokenData = `${encodedHeader}.${encodedPayload}`;

    // Tạo chữ ký cho token data
    const hmac = crypto.createHmac('sha256', jwtSecret);
    const signature = hmac.update(tokenData).digest('base64url');

    res.json({ 
        token: `${tokenData}.${signature}`, 
    });

    // const sessionId = Math.random().toString(36).substring(7);
    // sessions[sessionId] = { sub: user.id };
    // res.setHeader('Set-Cookie', `sessionId = ${sessionId}; httpOnly; max-age = 3600`).json({user});
});

// [GET] /api/auth/me
app.get('/api/auth/me', (req, res) => {
    const token = req.headers.authorization?.slice(7);
    if (!token) {
        return res.status(401)
            .json({ 
                message: "Unauthorized", 
            });
    }

    const [encodedHeader, encodedPayload, tokenSignature] = token.split('.');
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const hmac = crypto.createHmac('sha256', jwtSecret);
    const signature = hmac.update(tokenData).digest('base64url');

    if (signature !== tokenSignature) {
        return res.status(401)
            .json({ 
                message: "Unauthorized", 
            });
    }
    const payload = JSON.parse(atob(encodedPayload));
    const user = db.users.find(user => user.id === payload.sub);
    if (!user) {
        return res.status(401)
            .json({ 
                message: "Unauthorized", 
            });
    }
    res.json(user);

    // const session = sessions[req.cookies.sessionId];
    // if (!session) {
    //     return res.status(401)
    //         .json({ 
    //             message: "Unauthorized", 
    //         });
    // }
    // const user = db.users.find(user => user.id === session.sub);
    // if (!user) {
    //     return res.status(401)
    //         .json({ 
    //             message: "Unauthorized", 
    //         });
    // }
});

app.listen(port, () => {
  console.log(`Demo is running on port ${port}`);
});
