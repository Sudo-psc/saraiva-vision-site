const memoryStore = new Map();

class OfflineContentManager {
  constructor() {
    this.store = memoryStore;
  }

  storeContent(type, payload = {}, metadata = {}) {
    const key = `${type}:${metadata.source || 'default'}`;
    const entry = {
      content: payload,
      metadata: {
        ...metadata,
        storedAt: Date.now()
      }
    };
    this.store.set(key, entry);
    return entry;
  }

  getContent(type) {
    const results = [];
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith(`${type}:`)) {
        results.push(value.content);
      }
    }
    return results;
  }
}

let managerInstance = null;

export const getOfflineContentManager = () => {
  if (!managerInstance) {
    managerInstance = new OfflineContentManager();
  }
  return managerInstance;
};

export default OfflineContentManager;
