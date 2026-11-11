
const sql = require("mssql/msnodesqlv8");

const config = {
    server: "LAPTOP-TL3U871C\\SQLEXPRESS",
    database: "SecureLabDB",
    driver: "ODBC Driver 17 for SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        const pool = await sql.connect(config);
        console.log("¡Conexión exitosa con SQL Server!");
        return pool;
    } catch (error) {
        console.error("Error al conectar:", error.message);
        throw error;
    }
}

module.exports = { sql, connectDB };