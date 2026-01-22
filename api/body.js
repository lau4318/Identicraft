import { resolveUUID, getSkinURL, renderBody } from '../lib/minecraft.js';

export default async function handler(req, res) {
  try {
    const { username, size = '512' } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Missing username parameter' });
    }
    
    const sizeNum = parseInt(size);
    if (isNaN(sizeNum) || sizeNum < 8 || sizeNum > 512) {
      return res.status(400).json({ error: 'Size must be between 8 and 512' });
    }
    
    const uuid = await resolveUUID(username);
    const skinURL = await getSkinURL(uuid);
    
    if (!skinURL) {
      return res.status(404).json({ error: 'Skin not found' });
    }
    
    const imageBuffer = await renderBody(skinURL, sizeNum);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('CDN-Cache-Control', 'public, max-age=86400');
    
    return res.send(imageBuffer);
    
  } catch (error) {
    console.error('Body error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate body' });
  }
}