import type FlatfileListener from "@flatfile/listener";

import listeners from "./listeners";

/**
 * The Templates app defines a template builder app that ultimately produces
 * blueprint configurations.
 *
 * @param {FlatfileListener} globalListener - The unfiltered global listener.
 * @returns {void}
 */
export default function (globalListener: FlatfileListener): void {
  /**
   * Verify the environment has been configured properly:
   *
   *   1. Parse the JWT token to extract the environment ID if needed
   *   2. Ensure the required environment variables are set
   *   3. Load the Flatfile secrets into the environment
   */
  if (process.env.FLATFILE_BEARER_TOKEN && process.env.FLATFILE_BEARER_TOKEN.indexOf(".") > -1) {
    try {
      const [_header, payload, ..._signature] = process.env.FLATFILE_BEARER_TOKEN!.split(".");
      const jwt = JSON.parse(Buffer.from(payload!, "base64").toString());

      process.env.FLATFILE_ENVIRONMENT_ID ||= jwt.env;
    } catch (_error) {
      throw new Error(`Missing \`FLATFILE_ENVIRONMENT_ID\` environment variable.`);
    }
  }

  const REQUIRED_ENV_VARS = ["FLATFILE_ENVIRONMENT_ID", "FLATFILE_BEARER_TOKEN"];
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      throw new Error(`Missing \`${envVar}\` environment variable.`);
    }
  }

  if (!process.env.FLATFILE_EVENT_NAMESPACE) {
    console.warn("Warning: `FLATFILE_EVENT_NAMESPACE` is not set. Listener will recieve account-wide events.");
  }

  /**
   * Setup the Listener.
   */
  const DEBUG = process.env.DEBUG?.toLowerCase() === "true";
  const scopedListener = process.env.FLATFILE_EVENT_NAMESPACE
    ? globalListener.namespace(process.env.FLATFILE_EVENT_NAMESPACE)
    : globalListener;

  scopedListener.use(listeners);
}
