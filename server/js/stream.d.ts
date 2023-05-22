export class Stream {
    /**
     * @param {string} name
     *
     * @example
     * const stream = new Stream("altv");
     */
    public constructor(name: string, restore?: boolean);

    public onmessage: ((message: string) => any) | null;
    public onerror: ((error: string) => any) | null;
    public close(): void;

    private #onmessage(event: MessageEvent): void;
    private #onerror(event: MessageEvent): void;
}
