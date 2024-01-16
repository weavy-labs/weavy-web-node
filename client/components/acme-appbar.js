import { LitElement, html, css, nothing } from "lit";
import "@weavy/uikit-web";
import "./acme-messenger-button.js";
import "./acme-notification-badge.js";
import "./acme-notifications.js";

class AcmeAppbar extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;
  static properties = {
    socket: { attribute: false },
    user: { attribute: false },
    locale: { attribute: false }
  };

  constructor() {
    super();
    this.initTheme();
    this.initLocale();
  }

  createRenderRoot() {
    return this;
  }

  dispatchToggleMessenger(open) {
    const event = new CustomEvent("messenger-toggle", { detail: { open } });
    return this.dispatchEvent(event);
  }

  initTheme() {
    this.setTheme(this.getPreferredTheme());

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      this.setTheme(this.getPreferredTheme());
    });
  }

  getPreferredTheme() {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  setTheme(theme) {
    if (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      document.documentElement.classList.add("wy-dark");
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("wy-dark");
      } else {
        document.documentElement.classList.remove("wy-dark");
      }
    }
  }

  handleThemeClick() {
    const theme = document.documentElement.dataset.bsTheme === "light" ? "dark" : "light";
    localStorage.setItem("theme", theme);
    this.setTheme(theme);
  }

  dispatchLocaleChange(e, locale) {
    e.preventDefault();
    const event = new CustomEvent("locale", { detail: { locale }, bubbles: true, composed: true });
    return this.dispatchEvent(event);
  }

  initLocale() {
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      this.locale = storedLocale;
    }
  }

  handleLocaleClick(e) {
    this.locale = e.target.dataset.locale;
    this.dispatchLocaleChange(e, this.locale);
    localStorage.setItem("locale", this.locale)
  }

  render() {
    return html`
      <nav class="navbar navbar-expand fixed-top border-bottom">
        <div class="container-fluid">
          <div class="navbar-nav align-items-center">
            <a class="nav-link d-md-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#menu"
              ><span data-feather="menu"></span
            ></a>
            <a href="/"><img id="logo" src="/public/logo${this.locale === "xx-pirate" ? "-pirate" : ""}.png" height="32" alt="logo" /></a>
          </div>

          <div class="navbar-nav align-items-center">
          <div class="dropdown">
              <button
                class="btn btn-icon mx-2"
                type="button"
                data-bs-toggle="dropdown"
                @click=${() => this.dispatchToggleMessenger(false)}>
                <span data-feather="globe"></span>
              </button>
              <div class="dropdown-menu dropdown-menu-end py-0">
                <button class="dropdown-item ${!this.locale || this.locale === "en" ? "active" : ""}" data-locale="en" @click=${this.handleLocaleClick}>English (en)</button>
                <button class="dropdown-item ${this.locale === "xx-pirate" ? "active" : ""}" data-locale="xx-pirate" @click=${this.handleLocaleClick}>Pirate (xx-pirate)</button>
              </div>
            </div>

            <button
              class="btn btn-sm btn-icon mx-2 theme-switcher"
              type="button"
              title="Switch theme"
              @click=${() => this.handleThemeClick()}>
              <span data-feather="moon"></span>
              <span data-feather="sun"></span>
            </button>

            <div class="dropdown">
              <button
                class="btn btn-icon mx-2 "
                type="button"
                data-bs-toggle="dropdown"
                @click=${() => this.dispatchToggleMessenger(false)}>
                <span data-feather="bell"></span>
                <acme-notification-badge .socket=${this.socket}></acme-notification-badge>
              </button>
              <div class="dropdown-menu dropdown-menu-end py-0">
                <acme-notifications .socket=${this.socket}></acme-notifications>
              </div>
            </div>
            <acme-messenger-button @messenger-toggle=${() => this.dispatchToggleMessenger()}></acme-messenger-button>

            <div class="dropdown">
              ${this.user
                ? html`
                    <a class="nav-link mx-2" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <wy-avatar name=${this.user.name ?? ""} src=${this.user.avatar || null} size="32"></wy-avatar>
                    </a>
                  `
                : nothing}

              <div class="dropdown-menu dropdown-menu-end">
                <div class="align-items-center d-inline-flex flex-column pb-3 pt-4 w-100">
                  ${this.user
                    ? html`
                        <wy-avatar name=${this.user.name ?? ""} src=${this.user.avatar || null} size="64"></wy-avatar>
                        <h6 class="mt-2">${this.user.name}</h6>
                      `
                    : nothing}
                </div>
                <a href="/profile.html" class="dropdown-item"
                                    ><span data-feather="user"></span> Profile</a
                                >

                ${nothing /* <a href="#" class="dropdown-item"><span data-feather="settings"></span> Settings</a> */}
                <hr class="dropdown-divider" />
                <div class="d-grid px-3 py-2">
                  <a class="btn btn-secondary" href="/logout"><span data-feather="log-out"></span> Sign out</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  firstUpdated() {
    window.feather?.replace();
  }
}
customElements.define("acme-appbar", AcmeAppbar);
