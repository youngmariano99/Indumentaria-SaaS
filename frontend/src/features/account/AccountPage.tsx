import { UserCircle, Headset } from "@phosphor-icons/react";
import { useAuthStore } from "../auth/store/authStore";
import layoutStyles from "../dashboard/DashboardPage.module.css";
import ajustesStyles from "../ajustes/AjustesPage.module.css";

export function AccountPage() {
  const user = useAuthStore(state => state.user);

  return (
    <>
      <header className={layoutStyles.topbar}>
        <div className={layoutStyles.topbarRow}>
          <div className={layoutStyles.topbarTitle}>
            <h1>Mi cuenta</h1>
            <p>Datos básicos de la cuenta y del usuario con el que estás operando.</p>
          </div>
        </div>
      </header>

      <div className={ajustesStyles.page}>
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            padding: "var(--space-6) var(--space-6) var(--space-8)",
            display: "flex",
            flexDirection: "column" as const,
            gap: "var(--space-6)",
          }}
        >
          <div className={ajustesStyles.panel}>
            <div className={ajustesStyles.panelHeader}>
              <div>
                <h2 className={ajustesStyles.panelTitle}>
                  <UserCircle
                    size={22}
                    weight="bold"
                    style={{ marginRight: 8, verticalAlign: "middle" }}
                  />
                  Información de la cuenta
                </h2>
                <p className={ajustesStyles.panelDesc}>
                  Esta sección es solo informativa por ahora. Más opciones de edición se sumarán en futuras versiones.
                </p>
              </div>
            </div>

            <div className={ajustesStyles.editor}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-5)",
                  width: "100vh",
                  maxWidth: 960,
                  margin: "0 auto",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--color-gray-700)",
                      }}
                    >
                      Identidad del negocio
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.8rem",
                        color: "var(--color-gray-500)",
                      }}
                    >
                      Información asociada al tenant actual.
                    </p>
                  </div>

                  <dl
                    style={{
                      margin: 0,
                      display: "grid",
                      gridTemplateColumns: "130px minmax(0, 1fr)",
                      rowGap: "0.4rem",
                      columnGap: "1.25rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <dt style={{ fontWeight: 500, color: "var(--color-gray-600)" }}>
                      Nombre del negocio
                    </dt>
                    <dd
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "var(--color-gray-900)",
                      }}
                    >
                      {user?.nombre ?? "—"}
                    </dd>

                    <dt style={{ fontWeight: 500, color: "var(--color-gray-600)" }}>Tenant ID</dt>
                    <dd
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.8rem",
                        color: "var(--color-gray-700)",
                      }}
                    >
                      {user?.tenantId ?? "—"}
                    </dd>

                    <dt style={{ fontWeight: 500, color: "var(--color-gray-600)" }}>Usuario ID</dt>
                    <dd
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.8rem",
                        color: "var(--color-gray-700)",
                      }}
                    >
                      {user?.userId ?? "—"}
                    </dd>

                    <dt style={{ fontWeight: 500, color: "var(--color-gray-600)" }}>Rol</dt>
                    <dd
                      style={{
                        margin: 0,
                        textTransform: "capitalize",
                        color: "var(--color-gray-800)",
                      }}
                    >
                      {user?.rol ?? "—"}
                    </dd>
                  </dl>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-3)",
                    paddingTop: "var(--space-2)",
                    borderTop: "1px solid var(--color-gray-200)",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--color-gray-700)",
                      }}
                    >
                      Estado de la cuenta
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.8rem",
                        color: "var(--color-gray-500)",
                      }}
                    >
                      Información de plan y uso. Sin impacto operativo.
                    </p>
                  </div>

                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-gray-600)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500 }}>Plan actual:</span>{" "}
                      <span>Beta de pruebas</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>Ámbito:</span>{" "}
                      <span>Cuenta única por tenant</span>
                    </div>
                    <div style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
                      Para cambios de titularidad, facturación u otros datos legales, contactá al
                      equipo del estudio.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "var(--space-5)",
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "mailto:soporte@example.com?subject=Consulta%20de%20plan%20POS%20Indumentaria",
                        "_blank"
                      )
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.75rem",
                      borderRadius: "999px",
                      border: "1px solid var(--color-gray-300)",
                      background:
                        "linear-gradient(135deg, var(--color-gray-900), var(--color-gray-800))",
                      color: "#ffffff",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.35)",
                    }}
                  >
                    <Headset size={18} weight="bold" />
                    Contactar soporte para adquirir un plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

