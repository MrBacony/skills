#!/usr/bin/env node
import mongoose, { Schema } from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}

const SampleSchema = new Schema(
  {
    name: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
  },
  { collection: 'sample_items' }
);

const SampleModel =
  mongoose.models.SampleItem ?? mongoose.model('SampleItem', SampleSchema);

const seedData = [
  { name: 'Sample A' },
  { name: 'Sample B' },
  { name: 'Sample C' },
];

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await SampleModel.insertMany(seedData, { ordered: true });
  console.log(`Seeded ${seedData.length} items into sample_items`);
  process.exit(0);
} catch (error) {
  console.error('Seeding failed:', error);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}