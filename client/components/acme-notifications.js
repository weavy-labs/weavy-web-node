import { LitElement, html, css, nothing } from 'lit'
import { classMap } from "lit/directives/class-map.js";

class AcmeNotifications extends LitElement {
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
        
        if (changedProperties.has("socket") && this.socket) {            
            this.socket.on('notification_created', _msg => {                
                // notification from socket                
                this.getNotifications(false);
            });
            

            this.socket.on('notification_updated', _msg => {                
                // notification from socket                
                this.getNotifications(false);
            });
        }
    }

    firstUpdated() {
        this.getNotifications(false);
    }

    async getNotifications(refresh, retry = true) {
        var notificationsResponse = await fetch(`/api/notifications?unread=true&refresh=${refresh}`)
        if (notificationsResponse.status === 401 && retry) {
            // access token probably expired, try to get new token
            await this.getNotifications(true, false)
        } else if (notificationsResponse.status === 200) {
            this._notifications = await notificationsResponse.json()            
        } else {
            console.error('Could not get notifications from Weavy')
        }
    }
    
    async handleRead(id, type, refresh, retry = true) {
        
        var response = await fetch(`/api/notifications/${id}/mark?refresh=${refresh}`)
        if (response.status === 401 && retry) {
            // access token probably expired, try to get new token
            await this.handleRead(id, true, false)
        } else if (response.status === 200) {
            //await this.getNotifications(false)
            location.href = type == "message" ? "/chat.html" : type == "post" ? "/posts.html" : "files.html";
        } else {
            console.error('Could not mark single notification as read')
        }
    }

    render() {
        return html`<div class="card border-0">
            <div class="card-header text-center">Unread notifications</div>
            <div class="card-body p-0" style="max-height: 50vh; overflow: auto;">
                <div class="list-group list-group-flush">
                    ${this._notifications && this._notifications.data ? this._notifications.data.map((n) => html`
                <a href="#" class="list-group-item" @click=${() => this.handleRead(n.id, n.link.type, false)}>${n.plain}</a>
            `) : html` <p class="text-muted text-center my-3"><small>No unread notifications</small></p>
                    `}
                </div>
            </div>
            <div class="card-footer text-center p-1 border-0 border-top">
                <a href="/notifications.html"><small>Notification history</small></a>
            </div>  
        </div>`
        
        
    }
}

customElements.define('acme-notifications', AcmeNotifications)
