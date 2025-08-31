import { AdminGuard } from '@/src/components/auth/auth-guard';

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              システム管理者ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">システム全体の管理と設定</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ユーザー管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ユーザー管理
              </h3>
              <p className="text-gray-600 mb-4">
                職員アカウントの作成・編集・削除
              </p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                ユーザー管理へ
              </button>
            </div>

            {/* システム設定 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                システム設定
              </h3>
              <p className="text-gray-600 mb-4">システム全体の設定変更</p>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                設定変更へ
              </button>
            </div>

            {/* ロール・権限管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ロール・権限管理
              </h3>
              <p className="text-gray-600 mb-4">役職と権限の設定</p>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                権限管理へ
              </button>
            </div>

            {/* シフト管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                シフト管理
              </h3>
              <p className="text-gray-600 mb-4">月間シフトの作成・編集</p>
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                シフト管理へ
              </button>
            </div>

            {/* 勤怠管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                勤怠管理
              </h3>
              <p className="text-gray-600 mb-4">職員の勤怠確認・承認</p>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                勤怠管理へ
              </button>
            </div>

            {/* システム監視 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                システム監視
              </h3>
              <p className="text-gray-600 mb-4">ログ・パフォーマンス監視</p>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                監視画面へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
