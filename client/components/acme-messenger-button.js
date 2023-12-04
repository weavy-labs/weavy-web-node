import { LitElement, html, css } from 'lit'
import '@weavy/uikit-web'

class AcmeMessengerButton extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `

    createRenderRoot() {
        return this
    }

    dispatchToggleMessenger(e) {
        e.preventDefault()
        const event = new CustomEvent('messenger-toggle')
        return this.dispatchEvent(event)
    }

    render() {

        return html`
            <a class="btn btn-icon" href="#" role="button" @click=${this.dispatchToggleMessenger}>
                <span data-feather="message-square"></span>
                <wy-badge class="messenger-badge"></wy-badge>
            </a>
        `
    }

    firstUpdated() {
        window.feather?.replace();
    }
}
customElements.define('acme-messenger-button', AcmeMessengerButton)
