const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Fake DB (Mysql, MongoDB, ...)
const db = {
    users: [
        { 
            id: 1, 
            name: "Nguyen Van A",
            email: "nguyenvana@gmail.com", 
            password: "123456",  // ⛔ Never store password in plain text ✔️ Hash password (bcrypt, md5, sha256, ...)
        },
    ]
};

// Session (JWT, Cookie, Session) File, Redis, Memcached, ... --> Sync disk, memory, database
const sessions = {};

// [GET] /
app.get('/', (req, res) => {
    res.render("pages/index");
});

// [GET] /login
app.get('/login', (req, res) => {
    res.render("pages/login");
});

// [POST] /login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find((user) => user.email === email && user.password === password);
    if (user) {
        const sessionId = Math.random().toString(36).substring(7);
        sessions[sessionId] = {
            userId: user.id,
        };
        
        console.log(sessions);

        res.setHeader(
            'Set-Cookie', `sessionId = ${sessionId}; max-age = 3600; httpOnly`
        ).redirect('/dashboard');
        return;
    }
    res.send("Login Failed");
});

// [GET] /dashboard
app.get('/dashboard', (req, res) => {
    const session = sessions[req.cookies.sessionId];
    if (!session) {
        return res.redirect('/login');
    }

    const user = db.users.find((user) => user.id === session.userId);
    if (!user) {
        return res.redirect('/login');
    }

    res.render("pages/dashboard", { user });
});

// [GET] /logout
app.get('/logout', (req, res) => {
    delete sessions[req.cookies.sessionId];
    res.setHeader(
        'Set-Cookie', `sessionId = ; max-age = 0`
    ).redirect('/login');
});

app.listen(port, () => {
  console.log(`Demo is running on port ${port}`);
});
