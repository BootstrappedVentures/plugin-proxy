export default async function handler(req, res) {
    // Basic authentication.
    const ALLOWED_SECRET = process.env.PROXY_SECRET;
    const incomingSecret = req.headers['x-proxy-secret'];
  
    if (incomingSecret !== ALLOWED_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const IPINFO_TOKEN = process.env.IPINFO_TOKEN;
  
    // Get IP address from request query parameter or body
    const ip = req.query.ip || req.body?.ip;
    
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required. Provide it as a query parameter (?ip=1.2.3.4) or in the request body.' });
    }
  
    // Fetch IPInfo data for the provided IP
    const ipinfoUrl = `https://api.ipinfo.io/lite/${ip}?token=${IPINFO_TOKEN}`;
    
    try {
      const response = await fetch(ipinfoUrl);
      const data = await response.text(); // IPInfo lite endpoint returns plain text
      
      res.status(200).json({ 
        ip: ip,
        data: data 
      });
    } catch (error) {
      console.error('Error fetching IPInfo data:', error);
      res.status(500).json({ error: 'Failed to fetch IPInfo data' });
    }
  }