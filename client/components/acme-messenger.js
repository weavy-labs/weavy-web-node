import { LitElement, html, css } from 'lit'
import "@weavy/uikit-web"

class AcmeMessenger extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `

    static properties = {
        isOpen: { type: Boolean },
    }

    constructor() {
        super()
        this.isOpen = false
    }

    createRenderRoot() {
        return this
    }

    render() {
        return html`
            <div id="messenger" class="offcanvas-end-custom settings-panel border-0 border-start ${this.isOpen ? 'show' : ''}">
                <wy-messenger></wy-messenger>
            </div>
        `
    }
}
customElements.define('acme-messenger', AcmeMessenger)
