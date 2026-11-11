
const express = require("express");
const router = express.Router();
const { connectDB } = require("../database");

// Consultar todos los usuarios
router.get("/", async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request().query(`
            SELECT Id, Username, Email, Role, CreatedAt
            FROM Users
            ORDER BY Id DESC
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al consultar usuarios"
        });
    }
});

// Registrar un usuario
router.post("/", async (req, res) => {
    try {
        const { username, email, passwordHash, role } = req.body;

        if (!username || !email || !passwordHash) {
            return res.status(400).json({
                message: "Faltan datos obligatorios"
            });
        }

        const pool = await connectDB();

        const result = await pool.request()
            .input("username", username)
            .input("email", email)
            .input("passwordHash", passwordHash)
            .input("role", role || "user")
            .query(`
                INSERT INTO Users
                (Username, Email, PasswordHash, Role)
                OUTPUT INSERTED.Id, INSERTED.Username,
                       INSERTED.Email, INSERTED.Role
                VALUES
                (@username, @email, @passwordHash, @role)
            `);

        res.status(201).json({
            message: "Usuario registrado correctamente",
            user: result.recordset[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "No fue posible registrar el usuario"
        });
    }
});

module.exports = router;