
const express = require("express");
const crypto = require("crypto");

const router = express.Router();

let correoActual = "usuario@securelab.local";
const SESSION_DEMO = "securelab-session-demo";

const csrfTokens = new Map();

// Inicio de sesión de demostración
router.get("/login-demo", (req, res) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");

    csrfTokens.set(SESSION_DEMO, csrfToken);

    res.cookie("session", SESSION_DEMO, {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        path: "/"
    });

    res.json({
        message: "Sesión iniciada",
        correo: correoActual,
        csrfToken
    });
});

// Cambio de correo protegido
router.post("/change-email", (req, res) => {
    const session = req.cookies.session;
    const receivedToken = req.headers["x-csrf-token"];
    const expectedToken = csrfTokens.get(session);

    if (!session || !expectedToken) {
        return res.status(401).json({
            message: "Sesión no válida"
        });
    }

    if (!receivedToken || receivedToken !== expectedToken) {
        return res.status(403).json({
            message: "Token CSRF inválido o ausente"
        });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "El correo es obligatorio"
        });
    }

    correoActual = email;

    res.json({
        message: "Correo actualizado correctamente",
        nuevoCorreo: correoActual
    });
});

module.exports = router;