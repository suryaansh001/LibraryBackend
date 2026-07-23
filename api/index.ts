import { buildApp } from "../dist/app.js";
import type { LibraryOsApp } from "../dist/app.js";

let app: LibraryOsApp | null = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = buildApp();
    await app.ready();
  }
  app.server.emit("request", req, res);
}
