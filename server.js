import axios from 'axios';
import cors from 'cors';
import express from 'express';
import { parseHTML } from 'linkedom';

const app = express();

app.use(cors());

app.get('/api/link-preview', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const { data: html } = await axios.get(url);

    const { document } = parseHTML(html);

    function getMeta(name) {
      return document
        .querySelector(`meta[property="og:${name}"]`)
        ?.getAttribute('content');
    }

    const preview = {
      title: getMeta('title'),
      image: getMeta('image'),
      url: getMeta('url'),
    };

    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch link preview' });
  }
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));
