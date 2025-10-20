'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { RoleBasedLayout } from '@/components/layouts/role-based-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Building, Calendar, Download, FileText, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SystemExportPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // エクスポートの実行
  const executeExportMutation = trpc.export.executeExport.useMutation({
    onSuccess: data => {
      toast.success(`${data.file_name} のエクスポートが完了しました`);
      setIsExporting(null);
    },
    onError: error => {
      toast.error(`エクスポートに失敗しました: ${error.message}`);
      setIsExporting(null);
    },
  });

  const handleExport = async (
    exportType: 'attendance' | 'users' | 'facilities'
  ) => {
    console.log(`Starting export for type: ${exportType}`);
    setIsExporting(exportType);

    try {
      const result = await executeExportMutation.mutateAsync({
        export_type: exportType,
        file_format: 'csv',
        export_conditions: {},
        selected_fields: [],
      });

      console.log(`Export result for ${exportType}:`, result);

      // ダウンロードURLが返された場合、ファイルをダウンロード
      if (result.download_url) {
        console.log(`Downloading file: ${result.file_name}`);
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = result.file_name || `${exportType}_export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error(`No download URL returned for ${exportType}`);
      }
    } catch (error) {
      console.error(`Export error for ${exportType}:`, error);
    }
  };

  const getExportTypeInfo = (type: string) => {
    switch (type) {
      case 'attendance':
        return {
          icon: <Calendar className='w-6 h-6' />,
          title: '勤怠記録',
          description: '勤怠記録をCSV/Excel形式でエクスポートします',
          color: 'bg-blue-600 hover:bg-blue-700',
        };
      case 'users':
        return {
          icon: <Users className='w-6 h-6' />,
          title: 'ユーザー情報',
          description: 'ユーザー情報をCSV/Excel形式でエクスポートします',
          color: 'bg-green-600 hover:bg-green-700',
        };
      case 'facilities':
        return {
          icon: <Building className='w-6 h-6' />,
          title: '施設情報',
          description: '施設情報をCSV/Excel形式でエクスポートします',
          color: 'bg-purple-600 hover:bg-purple-700',
        };
      default:
        return {
          icon: <FileText className='w-6 h-6' />,
          title: 'データ',
          description: 'データをCSV/Excel形式でエクスポートします',
          color: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  return (
    <AuthGuard requiredRole='system_admin'>
      <RoleBasedLayout
        title='データエクスポート'
        description='勤怠記録、ユーザー情報、施設情報をCSV/Excel形式でエクスポートできます'
      >
        <div className='container mx-auto p-6'>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold'>データエクスポート</h1>
                <p className='text-gray-600 mt-2'>
                  勤怠記録、ユーザー情報、施設情報をCSV/Excel形式でエクスポートできます
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <Badge variant='outline' className='text-sm'>
                  <FileText className='w-4 h-4 mr-1' />
                  CSV/Excel対応
                </Badge>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {(['attendance', 'users', 'facilities'] as const).map(
                exportType => {
                  const info = getExportTypeInfo(exportType);
                  const isLoading = isExporting === exportType;

                  return (
                    <Card
                      key={exportType}
                      className='hover:shadow-lg transition-shadow'
                    >
                      <CardHeader>
                        <CardTitle className='flex items-center space-x-2'>
                          {info.icon}
                          <span>{info.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-gray-600 mb-4'>
                          {info.description}
                        </p>
                        <Button
                          onClick={() => handleExport(exportType)}
                          disabled={
                            isLoading || executeExportMutation.isPending
                          }
                          className={`w-full ${info.color}`}
                        >
                          <Download className='w-4 h-4 mr-2' />
                          {isLoading ? 'エクスポート中...' : 'エクスポート実行'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </RoleBasedLayout>
    </AuthGuard>
  );
}
