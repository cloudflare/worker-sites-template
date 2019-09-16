// everything in /api should be considered user code; we can consider
// providing a middleware for registering apis, too that abstracts away the
// event calls, but for now we should probably just provide a guideline.
// import { handleApiRequests } from './api'

import { handleStaticRequest } from './static/assets'

addEventListener('fetch', event => {
  event.respondWith(handleStaticRequest(event))
})