'use client';

import { useCallback, useEffect, useState } from 'react';

interface CatalogToastStateOptions {
  storageError: string | null;
  clearStorageError: () => void;
  timestampWarning: string | null;
  clearTimestampWarning: () => void;
  skipNotification: string | null;
  clearSkipNotification: () => void;
}

export function useCatalogToastState({
  storageError,
  clearStorageError,
  timestampWarning,
  clearTimestampWarning,
  skipNotification,
  clearSkipNotification,
}: CatalogToastStateOptions) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  useEffect(() => {
    if (storageError) {
      showToastMessage(storageError);
      clearStorageError();
    }
  }, [clearStorageError, showToastMessage, storageError]);

  useEffect(() => {
    if (timestampWarning) {
      showToastMessage(timestampWarning);
      clearTimestampWarning();
    }
  }, [clearTimestampWarning, showToastMessage, timestampWarning]);

  useEffect(() => {
    if (skipNotification) {
      showToastMessage(skipNotification);
      clearSkipNotification();
    }
  }, [clearSkipNotification, showToastMessage, skipNotification]);

  return {
    showToast,
    toastMessage,
    showToastMessage,
    hideToast,
  };
}
