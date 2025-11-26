import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import { initDB } from './config/database.js';
import linksRouter from './routes/links.js';
import { getLinkByCode, incrementClicks } from './models/link.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

app.use('/api/links', linksRouter);

app.get('/healthz', (req, res) => {
  res.status(200).json({
    ok: true,
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const testLink = await getLinkByCode('test');
    res.json({
      success: true,
      testResult: testLink || null
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    if (
      code.includes('.') ||
      code === 'healthz' ||
      code === 'api' ||
      code === 'test-db' ||
      code === 'favicon.ico' ||
      code.startsWith('_')
    ) {
      return res.status(404).json({ error: 'Not found' });
    }

    const link = await getLinkByCode(code);

    if (!link) {
      if (process.env.NODE_ENV === 'production') {
        return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      }
      return res.status(404).json({ error: 'Link not found' });
    }

    await incrementClicks(code);

    return res.redirect(302, link.original_url);
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}


const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT);
  } catch {
    process.exit(1);
  }
};

startServer();

export default app;
