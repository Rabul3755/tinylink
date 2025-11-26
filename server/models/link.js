import pool from '../config/database.js';
import validator from 'validator';

export const createLink = async (originalUrl, customCode = null) => {
  console.log(`🔗 Creating link for: ${originalUrl}, customCode: ${customCode}`);
  
  if (!validator.isURL(originalUrl)) {
    throw new Error('Invalid URL');
  }

  const code = customCode || generateRandomCode();
  
  if (!/^[A-Za-z0-9]{1,10}$/.test(code)) {
    throw new Error('Code must be 1-10 alphanumeric characters');
  }

  const client = await pool.connect();
  
  try {
    console.log(`📝 Inserting into database: code=${code}, url=${originalUrl}`);
    const result = await client.query(
      'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING *',
      [code, originalUrl]
    );
    console.log(`✅ Link created successfully:`, result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Database error in createLink:', err);
    if (err.code === '23505') { 
      throw new Error('Code already exists');
    }
    throw err;
  } finally {
    client.release();
  }
};

export const getLinkByCode = async (code) => {
  console.log(`🔍 Looking up code in database: ${code}`);
  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE code = $1',
      [code]
    );
    console.log(`📊 Found ${result.rows.length} results for code: ${code}`);
    if (result.rows.length > 0) {
      console.log(`✅ Link found:`, result.rows[0]);
    } else {
      console.log(`❌ No link found for code: ${code}`);
    }
    return result.rows[0];
  } catch (err) {
    console.error(`❌ Database error in getLinkByCode:`, err);
    throw err;
  }
};

export const getAllLinks = async () => {
  console.log(`📋 Getting all links from database`);
  try {
    const result = await pool.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );
    console.log(`✅ Found ${result.rows.length} total links`);
    return result.rows;
  } catch (err) {
    console.error('❌ Database error in getAllLinks:', err);
    throw err;
  }
};

export const incrementClicks = async (code) => {
  console.log(`👆 Incrementing clicks for code: ${code}`);
  try {
    await pool.query(
      'UPDATE links SET clicks = clicks + 1, last_clicked = CURRENT_TIMESTAMP WHERE code = $1',
      [code]
    );
    console.log(`✅ Clicks incremented for: ${code}`);
  } catch (err) {
    console.error('❌ Database error in incrementClicks:', err);
    throw err;
  }
};

export const deleteLink = async (code) => {
  console.log(`🗑️ Deleting link: ${code}`);
  try {
    const result = await pool.query(
      'DELETE FROM links WHERE code = $1 RETURNING *',
      [code]
    );
   
    return result.rows[0];
  } catch (err) {
    console.error('❌ Database error in deleteLink:', err);
    throw err;
  }
};

const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log(`🎲 Generated random code: ${result}`);
  return result;
};