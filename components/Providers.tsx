'use client';

import { AssetProvider } from '@/lib/assetStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AssetProvider>{children}</AssetProvider>;
}
