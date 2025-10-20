// エクスポートファイルダウンロードAPI

// import { FileGenerator } from '@/lib/services/file-generator';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exportId = params.id;

    // Supabaseクライアントの作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // エクスポート履歴の取得
    const { data: history, error: historyError } = await supabase
      .from('export_history')
      .select('*')
      .eq('id', exportId)
      .single();

    if (historyError) {
      console.error('Export history fetch error:', historyError);
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }

    if (!history) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }

    // ファイルが完了しているかチェック
    if (history.status !== 'completed') {
      return NextResponse.json({ error: 'Export not ready' }, { status: 400 });
    }

    // ファイルの存在確認
    console.log('Checking file path:', history.file_path);
    try {
      await fs.access(history.file_path);
    } catch (error) {
      console.log('File not found at path:', history.file_path);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // ファイルの読み込み
    const fileBuffer = await fs.readFile(history.file_path);

    // ダウンロード回数の増加
    await supabase.rpc('increment_download_count', { export_id: exportId });

    // レスポンスの作成
    const response = new NextResponse(fileBuffer as BodyInit);

    // ヘッダーの設定
    response.headers.set(
      'Content-Type',
      history.file_format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${history.file_name}"`
    );
    response.headers.set('Content-Length', history.file_size.toString());

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
