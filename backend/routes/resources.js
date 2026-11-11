
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { connectDB, sql } = require("../database");

const SECRET = "SecureLab_2026_Clave_Muy_Segura_Para_JWT";

// Middleware: verificar identidad mediante JWT
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token requerido"
            });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, SECRET, {
            algorithms: ["HS256"],
            issuer: "securelab.local"
        });

        const pool = await connectDB();

        const result = await pool.request()
            .input("username", sql.VarChar(100), decoded.username)
            .query(`
                SELECT Id, Username
                FROM Users
                WHERE Username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(403).json({
                message: "Usuario no autorizado"
            });
        }

        req.user = result.recordset[0];
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token inválido o usuario no autorizado"
        });
    }
}

// Consultar únicamente los recursos del usuario autenticado
router.get("/", authenticate, async (req, res) => {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input("ownerId", sql.Int, req.user.Id)
            .query(`
                SELECT
                    R.Id,
                    R.OwnerId,
                    R.ResourceName,
                    R.Description,
                    U.Username AS Owner,
                    R.CreatedAt
                FROM Resources R
                INNER JOIN Users U ON R.OwnerId = U.Id
                WHERE R.OwnerId = @ownerId
                ORDER BY R.Id DESC
            `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al consultar recursos"
        });
    }
});

// Registrar recurso: el propietario se obtiene del token
router.post("/", authenticate, async (req, res) => {
    try {
        const { resourceName, description } = req.body;

        if (!resourceName?.trim()) {
            return res.status(400).json({
                message: "Debes proporcionar un nombre válido"
            });
        }

        const pool = await connectDB();

        const result = await pool.request()
            .input("ownerId", sql.Int, req.user.Id)
            .input("resourceName", sql.VarChar(100), resourceName.trim())
            .input("description", sql.VarChar(sql.MAX), description || "")
            .query(`
                INSERT INTO Resources
                (OwnerId, ResourceName, Description)
                OUTPUT INSERTED.*
                VALUES (@ownerId, @resourceName, @description)
            `);

        res.status(201).json({
            message: "Recurso registrado correctamente",
            resource: result.recordset[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al registrar el recurso"
        });
    }
});

module.exports = router;