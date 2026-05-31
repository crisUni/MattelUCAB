import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import barbieImg from "../../assets/Barbie_Login.jpg";
import "../../styles/auth/Login.css";

/**
 * Pantalla de inicio de sesión de Mattel UCAB.
 * @returns Estructura JSX con el formulario de inicio de sesión.
 */
export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [transitionState, setTransitionState] = useState<
    "enter" | "entered" | "exit"
  >("enter");
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
    await loginUser({ email, password });
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
                Usa tu correo y contraseña para continuar.
              </p>
            </div>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label" htmlFor="login-email">
                  Correo Electronico
                </label>
                <input
                  className="auth-input"
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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

              <div className="auth-actions">
                <button className="auth-button" type="submit">
                  Iniciar Sesion
                </button>
                <p className="auth-helper">
                  <span>No eres parte de la familia Mattel?</span>
                  <button
                    className="auth-link"
                    type="button"
                    onClick={() => navigateWithTransition("/register")}
                  >
                    Crea tu cuenta!
                  </button>
                </p>
              </div>
            </form>
          </div>
        </section>
        <div className="auth-content__spacer" aria-hidden="true" />
      </main>
    </div>
  );
}

export default Login;
