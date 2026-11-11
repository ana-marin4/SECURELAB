
const express = require("express");
const router = express.Router();
const { connectDB, sql } = require("../database");

// Consultar publicaciones
router.get("/", async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
            SELECT
                P.Id,
                P.Title,
                P.Content,
                P.UserId,
                U.Username AS Author,
                P.CreatedAt
            FROM Posts P
            INNER JOIN Users U ON P.UserId = U.Id
            ORDER BY P.Id DESC
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al consultar publicaciones"
        });
    }
});

// Crear publicación
router.post("/", async (req, res) => {
    try {
        const { userId, title, content } = req.body;

        if (!Number.isInteger(Number(userId)) ||
            Number(userId) <= 0 ||
            !title?.trim() ||
            !content?.trim()) {
            return res.status(400).json({
                message: "Debes proporcionar un usuario, título y contenido válidos"
            });
        }

        const pool = await connectDB();

        const result = await pool.request()
            .input("userId", sql.Int, Number(userId))
            .input("title", sql.VarChar(150), title.trim())
            .input("content", sql.VarChar(sql.MAX), content.trim())
            .query(`
                INSERT INTO Posts (UserId, Title, Content)
                OUTPUT INSERTED.*
                VALUES (@userId, @title, @content)
            `);

        res.status(201).json({
            message: "Publicación creada correctamente",
            post: result.recordset[0]
        });

    } catch (error) {
        console.error(error);

        if (error.number === 547) {
            return res.status(400).json({
                message: "El usuario seleccionado no existe"
            });
        }

        res.status(500).json({
            message: "Error al crear la publicación"
        });
    }
});

module.exports = router;