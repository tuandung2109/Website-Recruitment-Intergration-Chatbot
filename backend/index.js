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

const ensureBucket = require("./config/ensureBucket");
ensureBucket().catch(e => console.error("ensureBucket error:", e));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ middleware
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:3000"];
app.use(cors({ 
  origin: corsOrigins,
  credentials: true 
}));
app.use(
  session({ secret: process.env.JWT_SECRET || "yourSecretKey", resave: false, saveUninitialized: true })
);
app.use(flash());

// ✅ Routes
route(app);
app.use("/api", jobPostingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cv", cvRoutes);
// ✅ Cấu hình cho phép truy cập file upload trực tiếp
app.use("/uploads", express.static("uploads"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", "./views");

// ✅ Health check endpoint (for Docker)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

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

// const port = process.env.PORT || 3001;
const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
