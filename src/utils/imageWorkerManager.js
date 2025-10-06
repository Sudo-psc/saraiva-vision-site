class ImageWorkerManager {
  constructor() {
    this.worker = null;
    this.initialized = false;
    this.pendingTasks = new Map();
    this.taskId = 0;
  }

  initialize() {
    if (this.initialized || typeof Worker === 'undefined') {
      return;
    }

    try {
      this.worker = new Worker('/image-worker.js');
      
      this.worker.addEventListener('message', (e) => {
        this.handleWorkerMessage(e.data);
      });

      this.worker.addEventListener('error', (error) => {
        console.error('Image Worker error:', error);
      });

      this.initialized = true;
      console.info('✅ Image Worker initialized');
    } catch (error) {
      console.warn('Failed to initialize Image Worker:', error);
    }
  }

  handleWorkerMessage(message) {
    const { data, error, taskId } = message;
    const task = this.pendingTasks.get(taskId);

    if (!task) return;

    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(data);
    }

    this.pendingTasks.delete(taskId);
  }

  async optimizeImage(imageData) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.worker) {
      return Promise.reject(new Error('Worker not available'));
    }

    return new Promise((resolve, reject) => {
      const taskId = ++this.taskId;
      
      this.pendingTasks.set(taskId, { resolve, reject });

      this.worker.postMessage({
        type: 'OPTIMIZE_IMAGE',
        data: imageData,
        taskId
      });

      setTimeout(() => {
        if (this.pendingTasks.has(taskId)) {
          this.pendingTasks.delete(taskId);
          reject(new Error('Image optimization timeout'));
        }
      }, 10000);
    });
  }

  async batchOptimize(images) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.worker) {
      return Promise.reject(new Error('Worker not available'));
    }

    return new Promise((resolve, reject) => {
      const taskId = ++this.taskId;
      
      this.pendingTasks.set(taskId, { resolve, reject });

      this.worker.postMessage({
        type: 'BATCH_OPTIMIZE',
        data: { images },
        taskId
      });

      setTimeout(() => {
        if (this.pendingTasks.has(taskId)) {
          this.pendingTasks.delete(taskId);
          reject(new Error('Batch optimization timeout'));
        }
      }, 30000);
    });
  }

  async validateImage(imageData) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.worker) {
      return Promise.reject(new Error('Worker not available'));
    }

    return new Promise((resolve, reject) => {
      const taskId = ++this.taskId;
      
      this.pendingTasks.set(taskId, { resolve, reject });

      this.worker.postMessage({
        type: 'VALIDATE_IMAGE',
        data: imageData,
        taskId
      });

      setTimeout(() => {
        if (this.pendingTasks.has(taskId)) {
          this.pendingTasks.delete(taskId);
          reject(new Error('Image validation timeout'));
        }
      }, 5000);
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.initialized = false;
      this.pendingTasks.clear();
    }
  }
}

export const imageWorkerManager = new ImageWorkerManager();

if (typeof window !== 'undefined') {
  imageWorkerManager.initialize();
}

export default ImageWorkerManager;
