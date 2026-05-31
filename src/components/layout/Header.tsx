import { Link } from "react-router-dom";
import logoPng from "../../assets/MattelUCAB-5-31-2026.png";
import accountPng from "../../assets/account logo.png";
import "../../styles/layout/Header.css";

/**
 * Reusable application header.
 *
 * Design goals:
 * - Works as a shared top-level navigation bar across most pages.
 * - Keeps the Barbie/Mattel pink theme but stays modern (solid glossy blocks + subtle motion).
 * - Accessible by default (semantic <header>/<nav>, focus-visible styles).
 *
 * Usage:
 * ```tsx
 * <Header
 *   logoTo="/"
 *   onAccountClick={() => console.log("account")}
 * />
 * ```
 */
export type HeaderProps = {
  /** Where the logo should navigate to (defaults to "/"). */
  logoTo?: string;

  /** Click handler for the Shop button (optional). */
  onShopClick?: () => void;

  /** Click handler for the Design button (optional). */
  onDesignClick?: () => void;

  /** Click handler for the Account button (optional). */
  onAccountClick?: () => void;

  /** Disable the Shop button until a page exists. */
  shopDisabled?: boolean;

  /** Disable the Design button until a page exists. */
  designDisabled?: boolean;
};

export function Header({
  logoTo = "/",
  onShopClick,
  onDesignClick,
  onAccountClick,
  shopDisabled = true,
  designDisabled = true,
}: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="app-header__inner">
        <div className="app-header__logo-slot">
          <Link className="app-header__logo-link" to={logoTo} aria-label="Ir al inicio">
            <img className="app-header__logo-img" src={logoPng} alt="Inicio" />
          </Link>
        </div>

        <nav className="app-header__nav" aria-label="Navegación principal">
          <button
            className="app-header__nav-button"
            type="button"
            onClick={onShopClick}
            disabled={shopDisabled}
          >
            Shop Barbie
          </button>
          <button
            className="app-header__nav-button"
            type="button"
            onClick={onDesignClick}
            disabled={designDisabled}
          >
            Design Barbie
          </button>
        </nav>

        <div className="app-header__account-slot">
          <button
            className="app-header__account-icon"
            type="button"
            onClick={onAccountClick}
            aria-label="Cuenta"
          >
            <img
              className="app-header__account-img"
              src={accountPng}
              alt=""
              aria-hidden="true"
            />
          </button>
          <button
            className="app-header__account"
            type="button"
            onClick={onAccountClick}
            aria-label="Cuenta"
          >
            Cuenta
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
