/* @flow */
import type { IncomingMessage, ServerResponse } from "http";
const fs = require("fs");
const path = require("path");
const url = require("url");
const githubWebhookHandler = require("github-webhook-handler");
const makeDebug = require("debug");
const AppContext = require("./app-context");
const webUI = require("./web-ui");

export type Handler = ((
  req: IncomingMessage,
  res: ServerResponse,
  next: (err: ?Error) => void
) => void) & {
  on: (
    eventType: string,
    callback: (event: { payload: Object }) => ?mixed
  ) => void,
};

export type SetupEventFunction = ({
  handler: Handler,
  appContext: AppContext,
  makeLogger: (prefix: string) => (message: string) => void,
}) => void;

module.exports = function createHandler(appContext: AppContext): Handler {
  const webhookHandler = githubWebhookHandler({
    path: "/",
    secret: fs
      .readFileSync(
        path.resolve(process.cwd(), appContext.config.webhookSecretFile),
        "utf-8"
      )
      .trim(),
  });

  const debugHttp = makeDebug("quinci:http");
  const handler = (req, res, next) => {
    debugHttp(req.method, req.url);
    webUI(appContext, req, res, () => {
      webhookHandler(req, res, next);
    });
  };
  handler.on = webhookHandler.on.bind(webhookHandler);

  [
    {
      loggerName: "commit-comment",
      setupEvent: require("./events/commit-comment"),
    },
    {
      loggerName: "pull-request-comment",
      setupEvent: require("./events/pull-request-comment"),
    },
    {
      loggerName: "pull-request",
      setupEvent: require("./events/pull-request"),
    },
    {
      loggerName: "push-to-master",
      setupEvent: require("./events/push-to-master"),
    },
  ].forEach(({ loggerName, setupEvent }) => {
    const debug = makeDebug(`quinci:${loggerName}`);
    const makeLogger = (prefix) => (msg) => debug(`${prefix}${msg}`);
    setupEvent({ handler, appContext, makeLogger });
  });

  return handler;
};
