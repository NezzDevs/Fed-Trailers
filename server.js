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
    
    const videosResponse = await axios.get(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`);
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
        embed_url: `https://www.youtube.com/embed/${primaryTrailer.key}?autoplay=1&mute=1&controls=0&disablekb=1&loop=1&playlist=${primaryTrailer.key}&cc_load_policy=0`
      }
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch trailer data'
    });
  }
});

app.get('/tv/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const videosResponse = await axios.get(`${TMDB_BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}`);
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
        embed_url: `https://www.youtube.com/embed/${primaryTrailer.key}?autoplay=1&mute=1&controls=0&disablekb=1&loop=1&playlist=${primaryTrailer.key}&cc_load_policy=0`
      }
    });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'TV show not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch trailer data'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Fed Trailer API',
    endpoints: ['/movie/:id', '/tv/:id', '/health']
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
