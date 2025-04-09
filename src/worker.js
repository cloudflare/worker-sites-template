import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const url = new URL(event.request.url);

  // If it's a POST to /api/contact
  if (url.pathname === "/api/contact" && event.request.method === "POST") {
    try {
      const data = await event.request.json();
      // Add logic for storing data or sending emails
      return new Response(
        JSON.stringify({ success: true, message: "Thanks for reaching out!" }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, message: "Error processing form." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Otherwise, serve static assets
  try {
    return await getAssetFromKV(event);
  } catch (e) {
    return new Response("Not found", { status: 404 });
  }
}