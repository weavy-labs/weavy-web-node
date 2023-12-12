/**
 * Configuration and startup for the @web/dev-server using the KOA middleware for API endpoints.
 */

import "dotenv/config";
import { startDevServer } from "@web/dev-server";
import { esbuildPlugin } from "@web/dev-server-esbuild";
import koaMiddleware from "./koa-middleware.mjs";

const WEB_PORT = process.env.AUTH_PORT || 3000;

const DEBUG = process.env.DEBUG || false;

if (!process.env.WEAVY_URL) {
    throw new Error('No WEAVY_URL defined in .env')
}

async function main() {
  const { server, koaApp, webSockets } = await startDevServer({
    config: {
      open: true,
      nodeResolve: true,
      //appIndex: './client/index.html',
      rootDir: "./client",
      debug: DEBUG,
      port: WEB_PORT,
      plugins: [
        esbuildPlugin({
          js: true,
          ts: true,
          target: "auto",
        }),
        {
          name: "env-plugin",
          transform(context) {
            if (context.response.is("html")) {
              let html = context.body;
              html = html.replace("{WEAVY_URL}", process.env.WEAVY_URL);
              html = html.replace("{ZOOM_AUTH_URL}", process.env.ZOOM_AUTH_URL);
              return { body: html, transformCache: false };
            }
          },
        },
      ],
    },
    readFileConfig: false,
  });

  // Needed for Socket.IO
  koaApp.server = server;

  koaApp.use(koaMiddleware(koaApp, webSockets.webSocketServer));
}

main();
