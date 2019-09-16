// everything in /api should be considered user code
import { handleApiRequests } from './api'

// handleStaticRequests should deal with getting stuff out of KV
// should not require that the user declare "routing", since
// the asset manifest will have that encapsulated.
import { handleStaticRequests } from './static/assets'
// handleNotFound may take a single response to return; should have default.
import { handleNotFound } from './static/notfound'
// here is the larger "Router". maybe this is 8track, maybe it is our template router,
// maybe it is a thing that just adds event listeners under the hood.
import { registerMiddlewares } from './packages/registerMiddlewares'

// the response handler should be optional
const myStaticHandler = handleStaticRequests(response => {
	// do something with the response
})

let middlewares = [
	handleApiRequests,
	myStaticHandler,
	handleNotFound,
]

// it would be great for it to be this easy.
// perhaps `handleNotFound` could be absorbed into "handleStaticRequests",
// or abstracted away into a flag that determines what to do on exceptions
// and/or cache/asset misses.
registerMiddlewares(middlewares)

/**
 * Here is where we might suggest users add API handlers.
 * These should execute based on a router that falls through
 * to remaining event listeners on undefined routes.
 */
addEventListener('fetch', event => {
	let response = await handleApiRequests(event)

	if (response) event.respondWith(response)
})

/**
 * This is the meat of static site serving. If we want to encourage
 * users to manipulate response bodies with something like HTMLRewriter,
 * we might consider adding an example of that here; between getting the
 * response out of KV, and actually returning it to the eyeball.
 */
addEventListener('fetch', event => {
	// we could just have this handler call .respondWith internally
	// but by returning the response, we give the user the opportunity
	// to manipulate the response using htmlRewriter or other tooling.
	// this would be post-cache, but it feels like that is fine,
	// as likely if you are doing something that dynamic you are
	// not looking to cache it..?
	let response = handleStaticRequests(event)

	if (response) event.respondWith(response)
})

/**
 * the API for middleware packages should likely be to define a function that takes an event and returns a response.
 * the API for our "router" package should take a list of functions that take an event and potentially do something
 * with it, and decide whether they are closed.
 * static sites should likely end with handleNotFound
 */

/**
 * Finally, we need a catch-all NotFound handler. To start we can
 * have this default to just redirecting to 404.html, but it's also pretty
 * trivial to give the user custom control over this, as we have done here
 * for workers docs.
 */
addEventListener('fetch', handleNotFound)
