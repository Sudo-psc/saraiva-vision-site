import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MAIN_CONTENT_ID = 'main-content';

export const useFocusOnRouteChange = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const mainElement = document.getElementById(MAIN_CONTENT_ID);

    if (!mainElement) {
      return;
    }

    const previousTabIndex = mainElement.getAttribute('tabindex');

    if (previousTabIndex === null) {
      mainElement.setAttribute('tabindex', '-1');
    }

    mainElement.focus({ preventScroll: true });

    return () => {
      if (previousTabIndex === null) {
        mainElement.removeAttribute('tabindex');
      }
    };
  }, [location.pathname, location.search, location.hash]);
};
