import { LitElement, html, css, nothing } from 'lit'

class AcmeNotificationBadge extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `
    
    static properties = {
        _count: { state: true },
        socket: { attribute: false }
    }

    constructor() {
        super()
        this._count = 0
    }

    createRenderRoot() {
        return this
    }

    willUpdate(changedProperties) {
        if (changedProperties.has("socket") && this.socket) {
            this.socket.on('notification_created', _msg => {
                // notification from socket                
                this.getNotificationCount();
            });

            this.socket.on('notifications_marked', _msg => {               
                // notifications marked from socket                
                this.getNotificationCount(false);
            });

            this.socket.on('notification_updated', _msg => {                
                // notification from socket                
                this.getNotificationCount();
            });
        }
    }

    firstUpdated() {
        this.getNotificationCount();
    }

    async getNotificationCount() {
        const notificationResponse = await fetch(`/api/notifications?unread=true&count_only=true`)
        if (notificationResponse.ok) {
            const notificationJson = await notificationResponse.json()
            this._count = notificationJson.count
        } else {
            console.error('Could not get notifications from Weavy', notificationResponse)
        }
    }

    render() {
        return this._count > 0 ? html` <span id="notification-badge" class="badge bg-danger">${this._count}</span> ` : nothing
    }
}

customElements.define('acme-notification-badge', AcmeNotificationBadge)
