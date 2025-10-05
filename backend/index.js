// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const path = require("path");
// const http = require("http");
// const session = require("express-session");
// const flash = require("connect-flash");
// const route = require("./routes/index.js");
// const supabase = require("./config/supabase"); // ✅ thêm dòng này

// dotenv.config();
// console.log("👉 Running file:", __filename);

// const app = express();
// const server = http.createServer(app);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const allowedOrigins = ["http://localhost:3000"];

// app.use(
//   session({
//     secret: "yourSecretKey",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(flash());

// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   next();
// });

// route(app);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.set("view engine", "ejs");
// app.set("views", "./views");

// const port = 9000 || process.env.PORT;
// server.listen(port, () => {
//   console.log(`✅ Server is running at http://localhost:${port}`);
// });


const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const session = require("express-session");
const flash = require("connect-flash");
const supabase = require("./config/supabase");
const route = require("./routes/index.js");

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

const port =9000|| process.env.PORT;
server.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
