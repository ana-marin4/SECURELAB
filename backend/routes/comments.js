
const express = require("express");
const router = express.Router();
const { connectDB, sql } = require("../database");

// Consultar comentarios
router.get("/", async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
            SELECT
                C.Id,
                C.PostId,
                C.UserId,
                C.Content,
                U.Username AS Author,
                P.Title AS PostTitle,
                C.CreatedAt
            FROM Comments C
            INNER JOIN Users U ON C.UserId = U.Id
            INNER JOIN Posts P ON C.PostId = P.Id
            ORDER BY C.Id DESC
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al consultar comentarios"
        });
    }
});

// Registrar comentario
router.post("/", async (req, res) => {
    try {
        const { postId, userId, content } = req.body;

        if (!Number.isInteger(Number(postId)) ||
            Number(postId) <= 0 ||
            !Number.isInteger(Number(userId)) ||
            Number(userId) <= 0 ||
            !content?.trim()) {

            return res.status(400).json({
                message: "Debes proporcionar una publicación, usuario y comentario válidos"
            });
        }

        const pool = await connectDB();

        const result = await pool.request()
            .input("postId", sql.Int, Number(postId))
            .input("userId", sql.Int, Number(userId))
            .input("content", sql.VarChar(sql.MAX), content.trim())
            .query(`
                INSERT INTO Comments (PostId, UserId, Content)
                OUTPUT INSERTED.*
                VALUES (@postId, @userId, @content)
            `);

        res.status(201).json({
            message: "Comentario registrado correctamente",
            comment: result.recordset[0]
        });

    } catch (error) {
        console.error(error);

        if (error.number === 547) {
            return res.status(400).json({
                message: "El usuario o la publicación no existen"
            });
        }

        res.status(500).json({
            message: "Error al registrar el comentario"
        });
    }
});

module.exports = router;