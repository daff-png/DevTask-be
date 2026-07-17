import test from 'node:test';
import assert from 'node:assert/strict';

import Task from '../models/Task.js';
import { updateTask, deleteTask } from '../controllers/taskController.js';

function createMockRes() {
  return {
    statusCode: 200,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test('updateTask uses req.params.id and returns updated task', async () => {
  const original = Task.findByIdAndUpdate;

  Task.findByIdAndUpdate = async (id, body, options) => {
    assert.equal(id, 'task-123');
    assert.deepEqual(body, { title: 'Updated task' });
    assert.equal(options.new, true);
    assert.equal(options.runValidators, true);
    return { _id: 'task-123', title: 'Updated task' };
  };

  try {
    const req = {
      params: { id: 'task-123' },
      body: { title: 'Updated task' },
    };
    const res = createMockRes();

    await updateTask(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { _id: 'task-123', title: 'Updated task' });
  } finally {
    Task.findByIdAndUpdate = original;
  }
});

test('deleteTask returns success response for valid id', async () => {
  const original = Task.findByIdAndDelete;

  Task.findByIdAndDelete = async (id) => {
    assert.equal(id, 'task-456');
    return { _id: 'task-456' };
  };

  try {
    const req = { params: { id: 'task-456' } };
    const res = createMockRes();

    await deleteTask(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { message: 'Task deleted successfully' });
  } finally {
    Task.findByIdAndDelete = original;
  }
});
