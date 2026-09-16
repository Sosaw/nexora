// api/extract.js - Relais Haute Disponibilité Vercel avec Edge Cache

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // Bouclier Anti-Surcharge : met en cache la réponse pendant 2h sur les serveurs mondiaux Vercel
  res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=600');

  const { tmdb_id, type, season, episode } = req.query;

  if (!tmdb_id) {
    return res.status(400).json({ success: false, error: 'tmdb_id requis' });
  }

  try {
    // URL source ou relais vers votre fournisseur de flux HLS (.m3u8)
    // Ce bloc distribue le flux directement sans solliciter votre machine
    const targetStream = `https://vidzy.org/embed-${tmdb_id}.html`; 

    return res.status(200).json({
      success: true,
      streamUrl: targetStream
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erreur lors de la récupération du flux' });
  }
}
