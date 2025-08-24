const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const TMDB_API_KEY = '5b9790d9305dca8713b9a0afad42ea8d';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.get('/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [movieResponse, videosResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
        params: { api_key: TMDB_API_KEY }
      })
    ]);

    const videos = videosResponse.data.results;

    const trailers = videos.filter(video => 
      video.site === 'YouTube' && 
      video.type === 'Trailer'
    );

    if (trailers.length === 0) {
      return res.status(404).json({
        error: 'No trailers found for this movie'
      });
    }

    const sortedTrailers = trailers.sort((a, b) => {
      if (a.name.toLowerCase().includes('official')) return -1;
      if (b.name.toLowerCase().includes('official')) return 1;
      return 0;
    });

    const primaryTrailer = sortedTrailers[0];

    res.json({
      trailer: {
        embed_url: `https://www.youtube.com/embed/${primaryTrailer.key}`
      }
    });

  } catch (error) {
    console.error('Error fetching movie trailer:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch trailer data',
      details: error.message 
    });
  }
});

app.get('/tv/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tvResponse, videosResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`${TMDB_BASE_URL}/tv/${id}/videos`, {
        params: { api_key: TMDB_API_KEY }
      })
    ]);

    const videos = videosResponse.data.results;

    const trailers = videos.filter(video => 
      video.site === 'YouTube' && 
      video.type === 'Trailer'
    );

    if (trailers.length === 0) {
      return res.status(404).json({
        error: 'No trailers found for this TV show'
      });
    }

    const sortedTrailers = trailers.sort((a, b) => {
      if (a.name.toLowerCase().includes('official')) return -1;
      if (b.name.toLowerCase().includes('official')) return 1;
      return 0;
    });

    const primaryTrailer = sortedTrailers[0];

    res.json({
      trailer: {
        embed_url: `https://www.youtube.com/embed/${primaryTrailer.key}`
      }
    });

  } catch (error) {
    console.error('Error fetching TV show trailer:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'TV show not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch trailer data',
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Fed Trailer API',
    version: '1.0.0',
    endpoints: {
      'GET /movie/:id': 'Get trailer for a movie by TMDB ID',
      'GET /tv/:id': 'Get trailer for a TV show by TMDB ID',
      'GET /health': 'Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Fed Trailer API running on port ${PORT}`);
});

module.exports = app;
