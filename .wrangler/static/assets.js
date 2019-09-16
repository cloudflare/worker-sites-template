import mime from 'mime/lite';

export function handleStaticRequest(responseHandler) {
  return event => {
    getAssets(event).then(response => {
      if (response) {
        if (responseHandler) {
          // user-provided response handler for things
          // like HTMLRewriter
          response = responseHandler(response)
        }
        event.respondWith(response)
      }
    }).catch(e => {
      // handle exception
    })
  }
}

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function getAssets(event) {
  try {
    const cache = caches.default;
    const req = cacheKey(event.request);

    if (
      req
      // static content is our KV bucket binding
      && typeof __STATIC_CONTENT !== "undefined"
    ) {
      const path = new URL(req.url).pathname;
      let res = await cache.match(cacheKey);

      if (res) {
        return res;
      }

      const contentType = mime.getType(path);
      const body = await __STATIC_CONTENT.get(
        path,
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

/**
 * For most static sites, you don't want to cache html. you certainly don't
 * want to tell the browser to. But if we version these things at the edge,
 * we can add a little caching magic even to html files?
 * NOTE: there is a potential race condition here!!!
 * if we upload to kv and update the worker with the new version, AND THEN the
 * new worker is called before the new content write has been completed, the worker
 * will cache the old version as the new and it will be worse than if we did no
 * cache busting. Depending on implementation, the asset manifest may help us here.
 */
function getCacheKey(request) {
  if (request.method !== "GET") return;
  const path = request.url.pathname;
  let manifestPath = __STATIC_ASSET_MANIFEST[path];

  let newUrl = new URL(manifestPath, request.url.origin)

  return new Request(newUrl, request)
}
