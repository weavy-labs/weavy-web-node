import { LitElement, html, css } from 'lit'

class AcmeAside extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `

    createRenderRoot() {
        return this
    }

    render() {
        return html`
            <aside id="menu" class="sidebar offcanvas-md offcanvas-start">
                <div class="offcanvas-header">
                    <img src="/public/logo.png" class="ms-3" height="32" alt="logo" />
                    <button class="btn btn-icon pe-2" type="button" data-bs-dismiss="offcanvas" data-bs-target="#menu">
                        <span data-feather="x"></span>
                    </button>
                </div>

                <div class="offcanvas-body">
                    <nav class="nav flex-column">
                        <a class="nav-link" href="/"><span data-feather="home"></span> Home</a>
                        <a class="nav-link" href="/users.html"><span data-feather="users"></span> Users</a>

                        <h6 class="sidebar-heading px-3 mt-3 mb-1 text-muted text-uppercase">Weavy apps</h6>

                        <a class="nav-link" href="/chat.html"><span data-feather="message-circle"></span> Chat</a>
                        <a class="nav-link" href="/feed.html"><span data-feather="columns"></span> Feed</a>
                        <a class="nav-link" href="/files.html"><span data-feather="folder"></span> Files</a>

                        <h6 class="sidebar-heading px-3 mt-3 mb-1 text-muted text-uppercase">Examples</h6>

                        <a class="nav-link" href="/examples-api.html">
                            <span data-feather="message-square"></span> Message API</a
                        >
                    </nav>
                </div>
            </aside>
        `
    }

    firstUpdated() {
        window.feather?.replace();
    }
}
customElements.define('acme-aside', AcmeAside)
