// backend/src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/appdb' });

const app = express();
app.use(bodyParser.json());

// simple health
app.get('/api/health', (req,res)=> res.json({ status: 'ok' }));

// sample CRUD for "items"
app.get('/api/items', async (req,res)=>{
  const r = await pool.query('SELECT id, name FROM items ORDER BY id');
  res.json(r.rows);
});
app.post('/api/items', async (req,res)=>{
  const { name } = req.body;
  const r = await pool.query('INSERT INTO items(name) VALUES($1) RETURNING id, name', [name]);
  res.status(201).json(r.rows[0]);
});

app.listen(PORT, ()=> console.log(`Backend listening on ${PORT}`));

