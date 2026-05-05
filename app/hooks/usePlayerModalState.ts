'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';

interface UsePlayerModalStateResult {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function usePlayerModalState(): UsePlayerModalStateResult {
  const [showModal, setShowModal] = useState(false);

  return {
    showModal,
    setShowModal,
  };
}
