import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import app from './app';

dotenv.config()
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 7700;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
