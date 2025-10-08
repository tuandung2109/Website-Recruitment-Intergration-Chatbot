const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const session = require("express-session");
const flash = require("connect-flash");
const supabase = require("./config/supabase");
const route = require("./routes/index.js");
const cvRoutes = require("./routes/cv");


// ✅ Thêm 2 dòng này từ app.js
const jobPostingRoutes = require("./routes/jobPostingRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
  session({ secret: "yourSecretKey", resave: false, saveUninitialized: true })
);
app.use(flash());

// ✅ Routes
route(app);
app.use("/api", jobPostingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", "./views");

// ✅ Test route (giống app.js)
app.get("/", (req, res) => {
  res.json({
    message: "Server đang chạy ngon!",
    api_endpoints: {
      auth: "/api/auth/login",
      jobs: "/api/job-postings",
    },
  });
});

const port = 9000 || process.env.PORT;
server.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
