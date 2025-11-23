import pool from '../config/database.js';
import validator from 'validator';

export const createLink = async (originalUrl, customCode = null) => {
  if (!validator.isURL(originalUrl)) {
    throw new Error('Invalid URL');
  }

  const code = customCode || generateRandomCode();
  
  if (!/^[A-Za-z0-9]{1,10}$/.test(code)) {
    throw new Error('Code must be 1-10 alphanumeric characters');
  }

  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING *',
      [code, originalUrl]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') { 
      throw new Error('Code already exists');
    }
    throw err;
  } finally {
    client.release();
  }
};

export const getLinkByCode = async (code) => {
  const result = await pool.query(
    'SELECT * FROM links WHERE code = $1',
    [code]
  );
  return result.rows[0];
};

export const getAllLinks = async () => {
  const result = await pool.query(
    'SELECT * FROM links ORDER BY created_at DESC'
  );
  return result.rows;
};

export const incrementClicks = async (code) => {
  await pool.query(
    'UPDATE links SET clicks = clicks + 1, last_clicked = CURRENT_TIMESTAMP WHERE code = $1',
    [code]
  );
};

export const deleteLink = async (code) => {
  const result = await pool.query(
    'DELETE FROM links WHERE code = $1 RETURNING *',
    [code]
  );
  return result.rows[0];
};

const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};