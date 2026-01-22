import { resolveUUID, getSkinURL, getSkin } from '../lib/minecraft.js';

export default async function handler(req, res) {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Missing username parameter' });
    }
    
    const uuid = await resolveUUID(username);
    const skinURL = await getSkinURL(uuid);
    
    if (!skinURL) {
      return res.status(404).json({ error: 'Skin not found' });
    }
    
    const skinBuffer = await getSkin(skinURL);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Disposition', `inline; filename="${username}.png"`);
    return res.send(skinBuffer);
    
  } catch (error) {
    console.error('Skin error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch skin' });
  }
}