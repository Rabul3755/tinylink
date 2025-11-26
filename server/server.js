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
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app', 
    process.env.CLIENT_URL 
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const testLink = await getLinkByCode('test');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      testResult: testLink || 'No test link found (this is normal)'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: err.message 
    });
  }
});

app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (code.includes('.') || 
        code === 'healthz' || 
        code === 'api' ||
        code === 'test-db' ||
        code.startsWith('_') ||
        code === 'favicon.ico') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    console.log(`🔗 Looking up code: ${code}`);
    const link = await getLinkByCode(code);
    
    if (!link) {
      if (process.env.NODE_ENV === 'production') {
        return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
      }
      return res.status(404).json({ error: 'Link not found' });
    }
    
    console.log(`✅ Redirecting ${code} to ${link.original_url}`);
    
    await incrementClicks(code);
    
    res.redirect(302, link.original_url);
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const startServer = async () => {
  try {
    console.log('🔄 Initializing database...');
    await initDB();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`❤️  Health: ${process.env.SERVER_URL || `http://localhost:${PORT}`}/healthz`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;