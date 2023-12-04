import { LitElement, html, css } from "lit";
//import { io } from "socket.io-client"; // not true esm package, contains cjs deps
import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

import "@weavy/uikit-web";
import "./acme-appbar.js";
import "./acme-aside.js";
import "./acme-messenger";
import "./acme-message-api";
import "./acme-users";
import './acme-profile'
import './acme-notification-history'

class AcmeLayout extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  static properties = {
    messengerIsOpen: { state: true },
    url: { type: String },
    socket: { state: true },
    user: { state: true },
    connected: { state: true, type: Boolean },
  };

  constructor() {
    super();
    this.messengerIsOpen = false;
    this.connected = false;
  }

  createRenderRoot() {
    return this.querySelector("main");
  }

  async join() {
    if (this.socket) {
      const response = await fetch("/api/uid");
      if (response.ok) {
        const json = await response.json();
        this.socket.emit("join", json.uid);
      }
    }
  }

  toggleMessenger(open) {
    if (open || open === false) {
      this.messengerIsOpen = open;
    } else {
      this.messengerIsOpen = !this.messengerIsOpen;
    }
  }

  async willUpdate(changedProperties) {
    if (changedProperties.has("connected") && this.connected) {
      this.join();
    }

    if (!this.user) {
      const response = await fetch("/api/user");
      if (response.ok) {
        this.user = await response.json();
      }
    }
  }

  render() {
    return html`
      <acme-appbar
        .socket=${this.socket}
        .user=${this.user}
        @messenger-toggle=${(e) => this.toggleMessenger(e.detail.open)}
        ></acme-appbar>
      <slot></slot>
      <acme-aside></acme-aside>
      <acme-messenger .isOpen=${this.messengerIsOpen}></acme-messenger>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    if (!this.socket) {
      this.socket = io();
      this.socket?.on("connect", () => {
        this.connected = true;
      });
    }
  }

  disconnectedCallback() {
    this.socket?.off("connect");
  }
}
customElements.define("acme-layout", AcmeLayout);
