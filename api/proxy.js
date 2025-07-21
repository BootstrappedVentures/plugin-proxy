export default async function handler(req, res) {
  const INSTACART_API_KEY = process.env.INSTACART_API_KEY;

  const siteUrl = req.headers['x-site-url'] || 'unknown';
  const pluginVersion = req.headers['x-plugin-version'] || 'unknown';

  // TODO: Replace with your analytics logic
  console.log(`[Usage] ${siteUrl} - Plugin v${pluginVersion}`);

  const response = await fetch('https://connect.instacart.com', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${INSTACART_API_KEY}`,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(200).json(data);
}