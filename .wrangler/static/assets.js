import mime from 'mime/lite';

export function handleStaticRequest(responseHandler) {
  return event => {
    let response = await getAssets(event)

    if (response) {
      if (responseHandler) {
        // user-provided response handler for things
        // like HTMLRewriter
        response = responseHandler(response)
      }
      event.respondWith(response)
    }
  }
}

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function getAssets(event) {
  try {
    const cache = caches.default;
    const req = getCacheKey(event.request);
    const path = new URL(req.url).pathname;

    if (
      req.method === "GET"
      // static content is our KV bucket binding
      && typeof __STATIC_CONTENT !== "undefined"
      // TODO: asset manifest should be a text_blob binding
      && path in __STATIC_ASSET_MANIFEST
    ) {
      let res = await cache.match(req);

      if (res) {
        return res;
      }

      const contentType = mime.getType(path);
      const body = await __STATIC_CONTENT.get(
        __STATIC_ASSET_MANIFEST[path],
        "arrayBuffer"
      );

      res = new Response(body, { status: 200 });
      res.headers.set("Content-Type", contentType);

      // TODO: immutable asset glob should be secret_name (env var) binding
      if (__IMMUTABLE_ASSETS.some(cachePath => minimatch(path, cachePath))) {
        res.headers.set("Cache-Control", "max-age=31536000, immutable");
        event.waitUntil(cache.put(req, res));
      }

      return res;
    }
  // first iteration: swallow the error and fall back to Not Found(?)
  } catch(e) {}
}
