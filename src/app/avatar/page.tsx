'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AvatarBuilder from '@/components/AvatarBuilder/AvatarBuilder';

function AvatarContent() {
  const searchParams = useSearchParams();
  const isNewProfile = searchParams.get('new') === 'true';
  return <AvatarBuilder forceNew={isNewProfile} />;
}

export default function AvatarPage() {
  return (
    <Suspense>
      <AvatarContent />
    </Suspense>
  );
}
