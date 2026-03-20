/**
 * Simple Promise-based mutex for serial execution of energy measurements.
 * Ensures only one submission is being measured at a time.
 */

interface QueuedRequest {
  resolve: () => void;
  reject: (err: Error) => void;
  timestamp: number;
}

const MAX_QUEUE_DEPTH = parseInt(process.env.MAX_QUEUE_DEPTH || "100", 10);
const QUEUE_TIMEOUT_MS = parseInt(process.env.QUEUE_TIMEOUT_MS || "60000", 10);

class ExecutionQueue {
  private locked = false;
  private queue: QueuedRequest[] = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    if (this.queue.length >= MAX_QUEUE_DEPTH) {
      throw new Error("Execution queue is full. Please try again later.");
    }

    return new Promise((resolve, reject) => {
      const request: QueuedRequest = { resolve, reject, timestamp: Date.now() };
      this.queue.push(request);

      setTimeout(() => {
        const index = this.queue.indexOf(request);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new Error("Queue timeout exceeded. Please try again."));
        }
      }, QUEUE_TIMEOUT_MS);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      if (Date.now() - next.timestamp < QUEUE_TIMEOUT_MS) {
        next.resolve();
      } else {
        this.release();
      }
    } else {
      this.locked = false;
    }
  }
}

const executionQueue = new ExecutionQueue();

export async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  await executionQueue.acquire();
  try {
    return await fn();
  } finally {
    executionQueue.release();
  }
}
