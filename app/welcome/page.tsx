export default function WelcomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #1a202c, #2563eb, #4f46e5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ maxWidth: "64rem", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                background: "#ea580c",
                padding: "1rem",
                borderRadius: "9999px",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6.5 6.5 11 11" />
                <path d="m21 21-1-1" />
                <path d="m3 3 1 1" />
                <path d="m18 22 4-4" />
                <path d="m2 6 4-4" />
                <path d="m3 10 7-7" />
                <path d="m14 21 7-7" />
              </svg>
            </div>
          </div>
          <h1
            style={{
              fontSize: "3.75rem",
              fontWeight: "bold",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            FitTrack
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#d1d5db",
              maxWidth: "42rem",
              margin: "0 auto",
            }}
          >
            Tu aplicación integral de seguimiento fitness. Registra entrenamientos, sesiones de running y obtén consejos
            nutricionales personalizados.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            maxWidth: "42rem",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "rgba(31, 41, 55, 0.5)",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "0.5rem" }}>Iniciar Sesión</h2>
            <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>
              ¿Ya tienes una cuenta? Inicia sesión para continuar
            </p>
            <a
              href="/auth/login"
              style={{
                display: "inline-block",
                width: "100%",
                background: "#2563eb",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Iniciar Sesión
            </a>
          </div>

          <div
            style={{
              background: "rgba(31, 41, 55, 0.5)",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "0.5rem" }}>Crear Cuenta</h2>
            <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>¿Nuevo en FitTrack? Crea tu cuenta gratuita</p>
            <a
              href="/auth/register"
              style={{
                display: "inline-block",
                width: "100%",
                background: "#ea580c",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Crear Cuenta
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
