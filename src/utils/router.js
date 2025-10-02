'use client';

import Link from 'next/link';
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const resolveHref = (input) => {
  if (!input) return '/';
  if (typeof input === 'string') return input;
  if (typeof input === 'object' && input.pathname) {
    const search = input.search ? `?${input.search}` : '';
    const hash = input.hash ? `#${input.hash}` : '';
    return `${input.pathname}${search}${hash}`;
  }
  return '/';
};

export function RouterLink({ to, href, replace = false, scroll, children, ...rest }) {
  const finalHref = useMemo(() => resolveHref(href ?? to), [href, to]);
  return (
    <Link href={finalHref} replace={replace} scroll={scroll} {...rest}>
      {children}
    </Link>
  );
}

export { RouterLink as Link };

export function useNavigate() {
  const router = useRouter();
  return (destination, options = {}) => {
    const target = resolveHref(destination);
    if (!target) return;
    if (options.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };
}

export function useParams() {
  return useNextParams();
}

export function useLocation() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const updateState = () => {
      const { hash: currentHash, search: currentSearch } = window.location;
      setHash(currentHash);
      setSearch(currentSearch);
    };

    updateState();
    window.addEventListener('hashchange', updateState);
    window.addEventListener('popstate', updateState);
    return () => {
      window.removeEventListener('hashchange', updateState);
      window.removeEventListener('popstate', updateState);
    };
  }, []);

  return { pathname, hash, search };
}

export function Navigate({ to, replace }) {
  const router = useRouter();

  useEffect(() => {
    const target = resolveHref(to);
    if (!target) return;
    if (replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  }, [replace, router, to]);

  return null;
}

export const BrowserRouter = ({ children }) => children;
export const MemoryRouter = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ element }) => element;
