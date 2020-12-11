export default class CyberPunk extends HTMLElement {
    static get attributes() {
        return {
            glitch: { default: false },
        };
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.setDefaults();
        this.requestRender();
    }

    render() {
        const content = CyberPunk.template.content.cloneNode(true);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(content);
        if (this.glitch) {
            this._doGlitch();
        }
    }

    async _doGlitch() {
        const text = this.innerHTML;
        const scrambleCount = Math.floor(Math.floor((Math.random() * text.length) / 10) + text.length / 20) + 1;
        const scrambleIterationCount = Math.floor(Math.random() * 10) + 2;
        for (let j = 0; j < scrambleIterationCount; j++) {
            let newText = text;
            for (let i = 0; i < scrambleCount; i++) {
                newText = this._scramble(newText);
            }
            this.innerHTML = newText;
            await this._wait(60);
        }
        this.innerHTML = text;
    }

    _scramble(text) {
        const index = Math.floor(Math.random() * Math.floor(text.length - 1));
        const random = Math.floor(Math.random() * 100);
        return text.substring(0, index) + String.fromCharCode(random) + text.substring(index + 1);
    }

    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static get template() {
        const template = document.createElement('template');
        template.innerHTML = `${CyberPunk.style}${CyberPunk.html}`;
        return template;
    }

    static get html() {
        return `<p><slot></slot></p>`;
    }

    static get style() {
        return `
            <style>
    :host {
        font-weight: bold;
        
        --flicker-easing: cubic-bezier(0.32, 0.32, 0, 0.92);
        --flicker-duration: 300ms;
        --fade-in-duration: 500ms;
    }

    p {
        color: #5fa4a5;
        text-shadow: 0 0 4px #5fa4a5;
        animation: flicker var(--flicker-duration) var(--flicker-easing);
    }

    :host([red]) p {
        color: #b35b5a;
        text-shadow: 0 0 4px #b35b5a;
    }

    :host([fadein]) p {
        animation: fade-in var(--fade-in-duration), flicker 300ms var(--flicker-easing) calc(var(--fade-in-duration) * 0.8);
        transform: translate(0,0);
        opacity: 1;
    }

    @keyframes flicker {
        0% { opacity: 0.75; }
        50% { opacity: 0.45; }
        100% { opacity: 1; }
    }

    @keyframes fade-in {
        from {
            transform: translate(-30px, 0px);
            opacity: 0;
        }
    }
            </style>
        `;
    }

    requestRender() {
        if (this._requestRenderCalled) return;

        this._requestRenderCalled = true;
        window.requestAnimationFrame(() => {
            this.render();
            this._requestRenderCalled = false;
        });
    }

    setDefaults() {
        const attributes = CyberPunk.attributes;
        Object.keys(attributes).forEach(attr => {
            if (!this[attr]) {
                this[attr] = attributes[attr].default;
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        this[name] = newValue === '' ? true : newValue;
        this.requestRender();
    }

    static get observedAttributes() {
        const attributes = CyberPunk.attributes;
        return Object.keys(attributes).filter(attr => {
            return typeof attributes[attr].watch === 'undefined' || attributes[attr].watch;
        });
    }
}

if (!customElements.get('cyber-punk')) {
    customElements.define('cyber-punk', CyberPunk);
}
