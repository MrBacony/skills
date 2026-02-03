#!/usr/bin/env node
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const result = await mongoose.connection.db.admin().ping();
  console.log('MongoDB ping OK:', result);
  process.exit(0);
} catch (error) {
  console.error('MongoDB healthcheck failed:', error);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}