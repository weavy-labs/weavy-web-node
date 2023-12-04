import { LitElement, html, css, nothing } from 'lit'
import {ref, createRef} from 'lit/directives/ref.js';

class AcmeProfile extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
    `
    
    inputNameRef = createRef();
    inputPhoneRef = createRef();

    static properties = {        
        profile: { state: true },
     
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
        this.getUser();
    }

    async getUser() {
        var response = await fetch(`/api/profile`)
        var profile = await response.json()            
        this.profile = profile;        
    }

    async handleSave(){
        const inputName = this.inputNameRef.value;
        const inputPhone = this.inputPhoneRef.value;

        var response = await fetch(`/api/profile`, {
            method: 'POST',
            headers: {                
                'Content-Type': 'application/json',
            },            
            body: JSON.stringify({
                username: this.profile.username,
                name: inputName.value,
                phone_number: inputPhone.value
            })
        });
        if (response.ok) {
            location.href="/"
            
        } else {
            console.error("Could not submit message to Weavy")
        }
    }

    render() {
        return html`<div class="container p-4">
            <fieldset>
                <legend class="text-center">Edit profile</legend>
                ${this.profile ? html`
                <div class="row g-3">
                    <div class="col-12 text-center">
                        <wy-avatar name=${this.profile.name} src=${this.profile.avatar || null} size="128"></wy-avatar>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-control" .value="${this.profile.name}"  ${ref(this.inputNameRef)} />
                        <span class="form-text">Display name.</span>
                    </div>                    
                    <div class="col-12">
                        <label class="form-label">Phone number</label>
                        <input type="text" class="form-control" .value="${this.profile.phone_number ?? ''}"  ${ref(this.inputPhoneRef)} />
                        <span class="form-text">Preferred telephone number.</span>
                    </div>

                    <div class="col-12">
                        <button type="button" @click=${this.handleSave} class="btn btn-primary">Save</button>
                        <a href="/" class="btn btn-link">Cancel</a>
                    </div>
                </div>
                `: nothing}
                
            </fieldset>
    </div>`
    }
}

customElements.define('acme-profile', AcmeProfile)
