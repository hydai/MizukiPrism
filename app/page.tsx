'use client';

import CatalogPageView from './components/CatalogPageView';
import { useCatalogPageController } from './hooks/useCatalogPageController';

export default function Home() {
  const catalogPage = useCatalogPageController();

  return <CatalogPageView {...catalogPage} />;
}
