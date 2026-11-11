
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Inicio");

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const endpoints = {
      Usuarios: {
        url: "/api/users",
        save: setUsers,
      },
      Publicaciones: {
        url: "/api/posts",
        save: setPosts,
      },
      Comentarios: {
        url: "/api/comments",
        save: setComments,
      },
      "Recursos privados": {
        url: "/api/resources",
        save: setResources,
      },
    };

    const selected = endpoints[active];

    if (!selected) return;

    setLoading(true);
    setError("");

    fetch(selected.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudieron consultar los datos.");
        }
        return response.json();
      })
      .then((data) => selected.save(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [active]);

  const menu = [
    { name: "Inicio", icon: "⌂" },
    { name: "Usuarios", icon: "♙" },
    { name: "Publicaciones", icon: "▤" },
    { name: "Comentarios", icon: "☰" },
    { name: "Recursos privados", icon: "▣" },
  ];

  const renderTable = (title, description, columns, data) => (
    <>
      <h2>{title}</h2>
      <p>{description}</p>

      {loading && <p>Cargando información...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.Id ?? index}>
                    {columns.map((column) => (
                      <td key={column.label}>
                        {item[column.field] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    No hay registros disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SecureLab</h2>
            <span>Security Management</span>
          </div>
        </div>

        <p className="menu-title">MENÚ PRINCIPAL</p>

        <nav>
          {menu.map((item) => (
            <button
              key={item.name}
              className={
                active === item.name
                  ? "menu-item active"
                  : "menu-item"
              }
              onClick={() => setActive(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          Sistema de pruebas local
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h3>Panel de administración</h3>
            <p>SecureLab / {active}</p>
          </div>

          <div className="profile">
            <div className="avatar">A</div>
            <span>Administrador</span>
          </div>
        </header>

        <section className="content">
          <div className="welcome">
            <div>
              <span className="eyebrow">CENTRO DE CONTROL</span>
              <h1>{active}</h1>
              <p>Bienvenido al sistema de gestión SecureLab.</p>
            </div>
            <div className="welcome-icon">🛡️</div>
          </div>

          <div className="stats">
            <div className="stat-card">
              <span>Usuarios registrados</span>
              <h2>{users.length}</h2>
              <small>Registros en SQL Server</small>
            </div>

            <div className="stat-card">
              <span>Publicaciones</span>
              <h2>{posts.length}</h2>
              <small>Registros del sistema</small>
            </div>

            <div className="stat-card">
              <span>Comentarios</span>
              <h2>{comments.length}</h2>
              <small>Actividad registrada</small>
            </div>
          </div>

          <div className="panel">
            {active === "Inicio" && (
              <>
                <h2>Actividad del sistema</h2>
                <p>
                  Selecciona un módulo del menú para consultar
                  la información almacenada en SecureLab.
                </p>
              </>
            )}

            {active === "Usuarios" &&
              renderTable(
                "Usuarios registrados",
                "Información obtenida desde SQL Server.",
                [
                  { label: "ID", field: "Id" },
                  { label: "Usuario", field: "Username" },
                  { label: "Correo", field: "Email" },
                  { label: "Rol", field: "Role" },
                ],
                users
              )}

            {active === "Publicaciones" &&
              renderTable(
                "Publicaciones",
                "Publicaciones registradas en el sistema.",
                [
                  { label: "ID", field: "Id" },
                  { label: "Título", field: "Title" },
                  { label: "Contenido", field: "Content" },
                  { label: "Autor", field: "Author" },
                ],
                posts
              )}

            {active === "Comentarios" &&
              renderTable(
                "Comentarios",
                "Comentarios registrados en las publicaciones.",
                [
                  { label: "ID", field: "Id" },
                  { label: "Comentario", field: "Content" },
                  { label: "Usuario", field: "Username" },
                  { label: "Publicación", field: "PostTitle" },
                ],
                comments
              )}

            {active === "Recursos privados" &&
              renderTable(
                "Recursos privados",
                "Recursos almacenados en la base de datos.",
                [
                  { label: "ID", field: "Id" },
                  { label: "Recurso", field: "ResourceName" },
                  { label: "Descripción", field: "Description" },
                  { label: "Propietario", field: "Owner" },
                ],
                resources
              )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;