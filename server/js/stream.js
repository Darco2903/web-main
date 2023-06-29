export class Stream {
    #msg = () => {};
    #err = () => {};

    /**
     * @param {string} name
     * @param {boolean} restore
     */
    constructor(name, restore = false) {
        window.addEventListener("beforeunload", this.close.bind(this));
        this.eventSource = new EventSource(`/php/stream.php?query=${name}&restore=${restore}`);
        this.eventSource.onmessage = this.#onmessage.bind(this);
        this.eventSource.onerror = this.#onerror.bind(this);
    }

    /**
     * @param {(message: string) => void} callback
     * @returns {void}
     */
    set onmessage(callback) {
        this.#msg = callback;
    }

    /**
     * @param {(error: string) => void} callback
     * @returns {void}
     */
    set onerror(callback) {
        this.#err = callback;
    }

    close() {
        this.eventSource.close();
    }

    refresh() {
        this.eventSource.close();
        this.eventSource = new EventSource(this.eventSource.url);
        this.eventSource.onmessage = this.#onmessage.bind(this);
        this.eventSource.onerror = this.#onerror.bind(this);
    }

    /**
     * @param {MessageEvent} event
     * @returns {void}
     */
    #onmessage(event) {
        const data = event.data;
        this.#msg(data);
    }

    /**
     * @param {MessageEvent} event
     * @returns {void}
     */
    #onerror(event) {
        this.eventSource.close();
        this.#err(event.data);
    }
}
