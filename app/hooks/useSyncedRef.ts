'use client';

import { useEffect } from 'react';

interface MutableRef<T> {
  current: T;
}

export function useSyncedRef<T>(ref: MutableRef<T>, value: T): void {
  useEffect(() => {
    ref.current = value;
  }, [ref, value]);
}
