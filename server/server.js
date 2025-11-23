import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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
    
    // Skip if it's a file request or health check
    if (code.includes('.') || code === 'healthz') {
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

// Stats page route
app.get('/code/:code', (req, res) => {
  res.json({ message: 'Stats page - handled by frontend' });
});

// Export the app for Vercel
export default app;