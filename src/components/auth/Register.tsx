import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import barbieImg from "../../assets/Barbie_Register.jpg";
import "../../styles/auth/Register.css";

/**
 * Pantalla de registro de Mattel UCAB.
 * @returns Estructura JSX con el formulario de registro.
 */
export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
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
   * Procesa el envío del formulario de registro.
   * @param event - Evento de submit del formulario.
   * @returns Promesa resuelta cuando finaliza la simulación del registro.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    await registerUser({ email, password, firstName, lastName, phone });
  };

  return (
    <div
      className="auth-screen auth-screen--register"
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
              <h2 className="auth-form__title">Registro</h2>
              <p className="auth-form__subtitle">
                Completa tus datos para unirte a la familia.
              </p>
            </div>
            <form className="auth-form auth-form--grid" onSubmit={handleSubmit}>
              <div className="auth-field auth-field--full">
                <label className="auth-label" htmlFor="register-email">
                  Correo Electronico
                </label>
                <input
                  className="auth-input"
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field auth-field--full">
                <label className="auth-label" htmlFor="register-password">
                  Contraseña
                </label>
                <input
                  className="auth-input"
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field auth-field--half">
                <label className="auth-label" htmlFor="register-first-name">
                  Nombre
                </label>
                <input
                  className="auth-input"
                  id="register-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field auth-field--half">
                <label className="auth-label" htmlFor="register-last-name">
                  Apellido
                </label>
                <input
                  className="auth-input"
                  id="register-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field auth-field--full">
                <label className="auth-label" htmlFor="register-phone">
                  Telefono
                </label>
                <input
                  className="auth-input"
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
              </div>

              <div className="auth-actions">
                <button className="auth-button" type="submit">
                  Registrate
                </button>
                <p className="auth-helper">
                  <span>¿Ya eres parte de la familia?</span>
                  <button
                    className="auth-link"
                    type="button"
                    onClick={() => navigateWithTransition("/")}
                  >
                    Inicia sesión
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

export default Register;
