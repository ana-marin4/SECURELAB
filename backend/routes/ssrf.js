
const express = require("express");
const dns = require("dns").promises;
const net = require("net");

const router = express.Router();

// Lista de destinos externos autorizados para el laboratorio.
const ALLOWED_HOSTS = [
    "example.com"
];

function isPrivateIPv4(ip) {
    const parts = ip.split(".").map(Number);

    if (parts.length !== 4) return true;

    const [a, b] = parts;

    return (
        a === 10 ||
        a === 127 ||
        a === 0 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a >= 224
    );
}

router.get("/fetch", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({
            message: "Debe proporcionar una URL"
        });
    }

    try {
        const parsed = new URL(url);

        if (parsed.protocol !== "https:") {
            return res.status(403).json({
                message: "Protocolo no permitido"
            });
        }

        if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
            return res.status(403).json({
                message: "Destino no autorizado"
            });
        }

        const addresses = await dns.lookup(parsed.hostname, {
            all: true
        });

        if (
            addresses.some(({ address }) =>
                net.isIP(address) === 4
                    ? isPrivateIPv4(address)
                    : true
            )
        ) {
            return res.status(403).json({
                message: "Dirección IP no permitida"
            });
        }

        const response = await fetch(parsed.href, {
            redirect: "error",
            signal: AbortSignal.timeout(5000)
        });

        const content = await response.text();

        res.json({
            message: "Solicitud autorizada",
            status: response.status,
            contenido: content.substring(0, 1000)
        });

    } catch (error) {
        res.status(403).json({
            message: "Solicitud bloqueada",
            error: error.message
        });
    }
});

module.exports = router;