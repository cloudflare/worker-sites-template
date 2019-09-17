import mime from 'mime/lite';

/**
 * Fetch and log a request
 * @param {Request} request
 */
export async function handleStaticRequest(event) {
  try {
    // const cache = caches.default;
    const req = getCacheKey(event.request);

    if (
      req
      && typeof __STATIC_CONTENT !== "undefined"
    ) {
      const path = normalize_path(new URL(req.url).pathname);
      // let res = await cache.match(req);

      // if (res) {
      //   return res;
      // }

      const contentType = mime.getType(path);
      const body = await __STATIC_CONTENT.get(
        path,
        "arrayBuffer"
      );

      let res = new Response(body, { status: 200 });
      res.headers.set("Content-Type", contentType);

      // // TODO: immutable asset glob should be secret_name (env var) binding
      // if (__IMMUTABLE_ASSETS.some(cachePath => minimatch(path, cachePath))) {
      //   res.headers.set("Cache-Control", "max-age=31536000, immutable");
      //   event.waitUntil(cache.put(req, res));
      // }

      return res
    } else {
      return new Response("not found", { status: 404 })
    }
  // first iteration: swallow the error and fall back to Not Found(?)
  } catch(e) {
    console.log("error", e)
    return new Response("internal server error", { status: 500 })
  }
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
  if (typeof __STATIC_ASSET_MANIFEST === "undefined") return request
  const path = request.url.pathname;
  let manifestPath = __STATIC_ASSET_MANIFEST[path];

  let newUrl = new URL(manifestPath, request.url.origin)
  console.log(newUrl)

  return new Request(newUrl, request)
}

/**
 * gets the path to look up in KV
 * e.g. /dir/ -> dir/index.html
 * @param {*} path
 * TODO: handle this in wrangler asset manifest logic
 */
export function normalize_path(path) {
  // strip first slash
  path = path.replace(/^\/+/, '')
  // root page
  if (path == '') {
    return 'index.html'
    // directory page with a trailing /
  } else if (path.endsWith('/')) {
    return path + 'index.html'
    // normal path, no need to do anything!
  } else {
    return path
  }
}
