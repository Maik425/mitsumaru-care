'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsIndex() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    if (!role || !email) {
      router.push('/');
      return;
    }
    if (role !== 'ADMIN' && role !== 'OWNER') {
      router.push('/?error=insufficient_permissions');
      return;
    }
    router.push('/admin/dashboard');
  }, [router]);

  return null;
}
