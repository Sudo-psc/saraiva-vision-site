export class FetchError extends Error {
  info: any;
  status: number;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.info = info;
  }
}

export async function defaultFetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new FetchError(
      info.error || `API error: ${res.status}`,
      res.status,
      info
    );
  }

  return res.json();
}

export async function fetcherWithToken<T = any>(
  url: string,
  token?: string
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new FetchError(
      info.error || `API error: ${res.status}`,
      res.status,
      info
    );
  }

  return res.json();
}

export async function postFetcher<T = any>(
  url: string,
  { arg }: { arg: any }
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new FetchError(
      info.error || `API error: ${res.status}`,
      res.status,
      info
    );
  }

  return res.json();
}

export async function patchFetcher<T = any>(
  url: string,
  { arg }: { arg: any }
): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new FetchError(
      info.error || `API error: ${res.status}`,
      res.status,
      info
    );
  }

  return res.json();
}

export async function deleteFetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    throw new FetchError(
      info.error || `API error: ${res.status}`,
      res.status,
      info
    );
  }

  return res.json();
}
