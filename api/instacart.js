export default async function handler(req, res) {
  // Basic authentication.
  const ALLOWED_SECRET = process.env.PROXY_SECRET;
  const incomingSecret = req.headers['x-proxy-secret'];

  if (incomingSecret !== ALLOWED_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const INSTACART_API_KEY = process.env.INSTACART_API_KEY;

  const instacartType = req.headers['x-instacart-type'] || 'recipe';

  let endpoint = 'https://connect.instacart.com';
  endpoint += '/idp/v1/';

  if ( 'shopping_list' === instacartType ) {
    endpoint += 'products/products_link';
  } else {
    // Default to recipe endpoint.
    endpoint += 'products/recipe';
  }

  // Analytics
  const siteUrl = req.headers['x-site-url'] || 'unknown';
  const pluginVersion = req.headers['x-plugin-version'] || 'unknown';

  // Log usage to Better Stack.
  const BETTERSTACK_URL = process.env.BETTERSTACK_URL;
  const BETTERSTACK_KEY = process.env.BETTERSTACK_KEY;

  const logPromise = fetch( BETTERSTACK_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BETTERSTACK_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Instacart API`,
      feature: `instacart-${instacartType}`,
      site: siteUrl,
      version: pluginVersion,
      timestamp: new Date().toISOString(),
    }),
  }).catch(console.error); // Don’t block proxy if logging fails

  // Proxy the API call.
  const response = await fetch( endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INSTACART_API_KEY}`,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();

  // Wait for logging to finish.
  await logPromise;

  res.status(200).json(data);
}