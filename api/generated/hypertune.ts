export interface Source {
  root: any;
}

export function createSource(): Source {
  return {
    root: {},
  };
}

export function initializeHypertune(config?: any): Source {
  return createSource();
}
