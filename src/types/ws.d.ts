declare module 'ws' {
  class WebSocket {
    static readonly OPEN: number;

    readonly readyState: number;

    close(code?: number, data?: string): void;
    send(data: string): void;
    on(event: 'close', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
  }

  namespace WebSocket {
    interface ServerOptions {
      path?: string;
    }

    class Server {}
  }

  export = WebSocket;
}
