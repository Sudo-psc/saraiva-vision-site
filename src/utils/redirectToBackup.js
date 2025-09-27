export const redirectToBackup = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const backupHost = 'backup.saraivavision.com.br';
  if (window.location.hostname === backupHost) {
    return;
  }

  const { pathname, search, hash } = window.location;
  const fallbackUrl = `https://${backupHost}${pathname}${search}${hash}`;

  try {
    window.location.replace(fallbackUrl);
  } catch (navigationError) {
    console.error('Failed to redirect to backup site:', navigationError);
    window.location.href = fallbackUrl;
  }
};
