
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./database");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const resourceRoutes = require("./routes/resources");
const authRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const csrfRoutes = require("./routes/csrf");
const ssrfRoutes = require("./routes/ssrf");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/csrf", csrfRoutes);
app.use("/api/ssrf", ssrfRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Bienvenido a SecureLab",
        status: "Servidor funcionando"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(
            "SELECT DB_NAME() AS databaseName"
        );

        res.json({
            message: "Conexión exitosa",
            database: result.recordset[0].databaseName
        });

    } catch (error) {
        res.status(500).json({
            message: "Error de conexión",
            error: error.message
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor SecureLab funcionando en http://localhost:${PORT}`);
});