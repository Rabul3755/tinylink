import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import { initDB } from './config/database.js';
import linksRouter from './routes/links.js';
import { getLinkByCode, incrementClicks } from './models/link.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Initialize database
initDB();

// API Routes
app.use('/api/links', linksRouter);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ 
    ok: true, 
    version: '1.0',
    timestamp: new Date().toISOString()
  });
});

// Redirect route - /:code
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Skip if it's a file request or known routes
    if (code.includes('.') || code === 'healthz' || code === 'api') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const link = await getLinkByCode(code);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Increment click count
    await incrementClicks(code);
    
    // Redirect to original URL
    res.redirect(302, link.original_url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch all handler - serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/healthz`);
  console.log(`🔗 API: http://localhost:${PORT}/api/links`);
});