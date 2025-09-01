'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminStaffIndexPage() {
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
    // 既存のスタッフ関連ページに誘導する場合はここでpush
    // router.push('/admin/settings/accounts');
  }, [router]);

  return null;
}
