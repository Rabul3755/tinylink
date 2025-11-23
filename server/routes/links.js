import express from 'express';
import * as linkModel from '../models/link.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url, customCode } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const link = await linkModel.createLink(url, customCode);
    res.status(201).json(link);
  } catch (err) {
    if (err.message === 'Invalid URL') {
      res.status(400).json({ error: 'Invalid URL' });
    } else if (err.message === 'Code already exists') {
      res.status(409).json({ error: 'Custom code already exists' });
    } else {
      console.error('Error creating link:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const links = await linkModel.getAllLinks();
    res.json(links);
  } catch (err) {
    console.error('Error fetching links:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const link = await linkModel.getLinkByCode(code);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json(link);
  } catch (err) {
    console.error('Error fetching link:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const deletedLink = await linkModel.deleteLink(code);
    
    if (!deletedLink) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json({ message: 'Link deleted successfully' });
  } catch (err) {
    console.error('Error deleting link:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;