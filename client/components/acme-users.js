import { LitElement, html, css } from 'lit'

class AcmeUsers extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `
    
    static properties = {        
        users: { state: true },
     
    }

    constructor() {
        super()
        
    }

    createRenderRoot() {
        return this
    }

    willUpdate(changedProperties) {
        
    }

    async firstUpdated() {
        this.getUsers();
    }

    async getUsers() {
        var response = await fetch(`/api/users`)
        var users = await response.json()    
        this.users = users;
        
    }

    render() {
        return html`<div class="container-fluid p-4">

           <table class="table table-users table-striped">
               <tbody>
                ${this.users && this.users.map((u) => html`
                <tr>
                    <td><wy-avatar name=${u.name ?? ''} src=${u.avatar || null} size="24"></wy-avatar></td>
                    <td>${u.name} <small class="text-muted">@${u.username}</small></td>
                </tr>
                `)}
            </tbody>
       </table>
    </div>`
    }
}

customElements.define('acme-users', AcmeUsers)
