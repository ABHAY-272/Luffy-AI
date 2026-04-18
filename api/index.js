import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Apne compiled backend ko import karo
// Note: Build ke baad .ts files .js ban jati hain
import { app } from '../artifacts/api-server/src/index.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Frontend static files serve karne ke liye
// Agar tumhara build folder 'dist' hai toh yahan 'dist' likho
const frontendPath = path.join(__dirname, '../dist');
app.use(express.static(frontendPath));

// 404 Fix: Saari unknown requests ko frontend par bhej do
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Port handle karne ke liye (Ye sirf fallback hai, index.ts wala listen bhi chalega)
const PORT = process.env.PORT || 3000;
console.log(`🚀 Server initialized on port ${PORT}`);