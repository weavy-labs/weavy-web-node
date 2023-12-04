import { LitElement, html, css, nothing } from 'lit'
import { classMap } from "lit/directives/class-map.js";

class AcmeNotificationHistory extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `
    
     static properties = {
         _notifications: { state: true },         
         socket: { attribute: false }
     }

    constructor() {
        super()
        this._notifications = null
        this.socket = undefined
    }

    createRenderRoot() {
        return this
    }

    willUpdate(changedProperties) {
      
    }

    firstUpdated() {
        this.getNotifications(false);
    }

    updated(){
        window.feather.replace()
    }

    async getNotifications(refresh, retry = true) {
        var notificationsResponse = await fetch(`/api/notifications?refresh=${refresh}`)
        if (notificationsResponse.status === 401 && retry) {
            // access token probably expired, try to get new token
            await this.getNotifications(true, false)
        } else if (notificationsResponse.status === 200) {
            this._notifications = await notificationsResponse.json()            
        } else {
            console.error('Could not get notifications from Weavy')
        }
    }

    async handleMark(refresh, retry = true) {
        
        var response = await fetch(`/api/notifications/mark?refresh=${refresh}`)
        if (response.status === 401 && retry) {
            // access token probably expired, try to get new token
            await this.handleMark(true, false)
        } else if (response.status === 200) {
            await this.getNotifications(false)
        } else {
            console.error('Could not mark notifications as read')
        }
    }

    async handleRead(id, type, refresh, retry = true) {
        
        var response = await fetch(`/api/notifications/${id}/mark?refresh=${refresh}`)
        if (response.status === 401 && retry) {
            // access token probably expired, try to get new token
            await this.handleRead(id, true, false)
        } else if (response.status === 200) {
            await this.getNotifications(false)            
        } else {
            console.error('Could not mark single notification as read')
        }
    }

    async handleUnread(id, refresh, retry = true) {
        
        var response = await fetch(`/api/notifications/${id}/unmark?refresh=${refresh}`)
        if (response.status === 401 && retry) {
            // access token probably expired, try to get new token
            await this.handleUnread(id, true, false)
        } else if (response.status === 200) {
            await this.getNotifications(false)            
        } else {
            console.error('Could not mark single notification as unread')
        }
    }

    render() {
        return html`<div class="container-fluid p-4">
            <header class="d-flex  justify-content-between align-items-center ">
                <h1>Notifications</h1>                
                <button type="submit" class="btn btn-link btn-sm px-0" @click=${() => this.handleMark(false)}>Mark all as read</button>                
            </header>

            <div class="list-group">
                
                ${this._notifications && this._notifications.data ? this._notifications.data.map((n) => n.is_unread ? html`

                <div class="list-group-item unread d-flex justify-content-between align-items-center">
                    ${n.plain}
                    <button type="submit" class="btn btn-sm btn-icon" title="Mark as read" @click=${() => this.handleRead(n.id, false)}>
                        <span data-feather="check"></span>
                    </button>
                </div>
            `: html`
            <div class="list-group-item read d-flex justify-content-between align-items-center">
                    ${n.plain}
                    <button type="submit" class="btn btn-sm btn-icon" title="Mark as unread" @click=${() => this.handleUnread(n.id, false)}>
                        <span data-feather="circle"></span>
                    </button>
                </div>
            `) : nothing}
            </div>
        </div>`
        
        
    }
}

customElements.define('acme-notification-history', AcmeNotificationHistory)
