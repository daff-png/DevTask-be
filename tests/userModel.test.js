import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import User from '../models/User.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devtask';

before(async () => {
  await mongoose.connect(mongoUri);
});

after(async () => {
  await mongoose.disconnect();
});

test('user pre-save hook hashes password on create', async () => {
  const email = `seed-test-${Date.now()}@example.com`;
  const user = new User({
    name: 'Seed Test',
    email,
    password: 'password123',
    role: 'PM',
  });

  await user.save();

  assert.notEqual(user.password, 'password123');
  assert.match(user.password, /^\$2[aby]\$/);

  await User.deleteOne({ _id: user._id });
});
