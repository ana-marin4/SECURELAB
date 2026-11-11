
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Clave de prueba para el laboratorio.
// En producción debe almacenarse en una variable de entorno.
const SECRET = "SecureLab_2026_Clave_Muy_Segura_Para_JWT";

// Emisión de token: el rol se asigna desde el servidor.
router.post("/token", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({
            message: "El usuario es obligatorio"
        });
    }

    // Para esta demostración, los usuarios normales no pueden
    // elegir su propio rol.
    const role = username === "admin" ? "admin" : "user";

    const token = jwt.sign(
        { username, role },
        SECRET,
        {
            algorithm: "HS256",
            expiresIn: "1h",
            issuer: "securelab.local"
        }
    );

    res.json({ token });
});

// Validación segura: verifica firma, algoritmo, expiración y emisor.
router.get("/admin", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Token requerido o formato inválido"
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, SECRET, {
            algorithms: ["HS256"],
            issuer: "securelab.local"
        });

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Acceso denegado"
            });
        }

        return res.json({
            message: "Acceso administrativo concedido",
            user: decoded.username,
            role: decoded.role
        });

    } catch (error) {
        return res.status(401).json({
            message: "Token inválido o firma no verificada"
        });
    }
});

module.exports = router;