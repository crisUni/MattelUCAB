import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import barbieImg from "../../assets/Barbie_Login.jpg";
import "../../styles/auth/Login.css";

/**
 * Pantalla de inicio de sesión de Mattel UCAB.
 * @returns Estructura JSX con el formulario de inicio de sesión.
 */
export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [transitionState, setTransitionState] = useState<
    "enter" | "entered" | "exit"
  >("enter");
  const { iniciarSesion, entrarComoInvitado } = useSession();
  const navigate = useNavigate();
  const formSectionRef = useRef<HTMLElement | null>(null);

  const navigateWithTransition = useMemo(() => {
    return (to: string) => {
      setTransitionState("exit");
      window.setTimeout(() => navigate(to), 180);
    };
  }, [navigate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const animationId = window.requestAnimationFrame(() =>
      setTransitionState("entered")
    );

    const scrollEl = formSectionRef.current;
    const scrollFactor = 0.55;
    const handleWheel = (event: WheelEvent) => {
      if (!scrollEl) return;
      if (event.ctrlKey) return;

      const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScrollTop <= 0) return;

      event.preventDefault();
      scrollEl.scrollTop += event.deltaY * scrollFactor;
    };

    scrollEl?.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(animationId);
      scrollEl?.removeEventListener("wheel", handleWheel);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /**
   * Procesa el envío del formulario de inicio de sesión.
   * @param event - Evento de submit del formulario.
   * @returns Promesa resuelta cuando finaliza la simulación del login.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const ok = await iniciarSesion(username, password);
      if (ok) navigateWithTransition("/app");
      else setError("Usuario o contraseña incorrectos.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const handleInvitado = async (): Promise<void> => {
    await entrarComoInvitado();
    navigateWithTransition("/app");
  };

  return (
    <div
      className="auth-screen auth-screen--login"
      data-transition={transitionState}
    >
      <header className="auth-hero">
        <img className="auth-hero__image" src={barbieImg} alt="Barbie" />
        <div className="auth-hero__overlay" aria-hidden="true" />
      </header>

      <main className="auth-content">
        <section className="auth-content__form-section" ref={formSectionRef}>
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2 className="auth-form__title">Inicia sesión</h2>
              <p className="auth-form__subtitle">
                Usa tu usuario y contraseña para continuar.
              </p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-username">
                  Usuario
                </label>
                <input
                  className="auth-input"
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="login-password">
                  Contraseña
                </label>
                <input
                  className="auth-input"
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="auth-error" role="alert" style={{ color: "#d11", margin: "4px 0", fontSize: "0.9rem" }}>
                  {error}
                </p>
              )}

              <div className="auth-actions">
                <button className="auth-button" type="submit" disabled={enviando}>
                  {enviando ? "Verificando…" : "Iniciar Sesión"}
                </button>
              </div>
            </form>

            <button
              type="button"
              className="auth-guest-link"
              onClick={handleInvitado}
              style={{ marginTop: "14px", background: "none", border: "none", color: "#b3146e", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }}
            >
              Entrar como invitado (solo catálogo)
            </button>
          </div>
        </section>
        <div className="auth-content__spacer" aria-hidden="true" />
      </main>
    </div>
  );
}

export default Login;
