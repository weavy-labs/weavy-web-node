import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

class AcmeMessageApi extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  inputRef = createRef();

  static properties = {
    appId: { type: Number },
    result: { state: true },
  };

  constructor() {
    super();
  }

  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    const response = await fetch("/api/contextual/acme-chat-message-api-2?type=chat");
    const json = await response.json();
    this.appId = json.id;
  }

  async handleSubmit() {
    const input = this.inputRef.value;
    const text = input.value;

    try {
      const messageResponse = await fetch(`/api/examples/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: this.appId,
          text: text,
        }),
      });
      
      if (!messageResponse.ok) {
        throw new Error("Network response was not OK");
      }
  
      const messageJson = await messageResponse.json();
      this.result = JSON.stringify(messageJson, null, 3);

    } catch (error) {
      console.error("Could not submit message to Weavy:", error);
    }
  }

  render() {
    return html`<div class="d-flex">
      <div class="contextual-app w-50 p-4 overflow-y-auto">
        <h3>Message API</h3>
        <p>Example that shows how to post a chat message via the Web API.</p>

        <div class="mb-3">
          <label class="form-label">Chat message</label>
          <textarea
            ${ref(this.inputRef)}
            class="form-control"
            id="messageText"
            rows=${3}
            placeholder="Write your message here..."></textarea>
        </div>
        <div class="mb-3">
          <button id="messageBtn" type="button" class="btn btn-primary" @click=${this.handleSubmit}>Submit</button>
        </div>
        <div class="mb-3">
          <label class="form-label">Response</label>
          <pre class="code"><code id="msgResult">${this.result}</code></pre>
        </div>
      </div>
      <div class="contextual-app w-50 border-start">
        <wy-chat uid="acme-chat-message-api-2"></wy-chat>
      </div>
    </div>`;
  }
}

customElements.define("acme-message-api", AcmeMessageApi);
