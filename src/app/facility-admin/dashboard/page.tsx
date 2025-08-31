import { FacilityAdminGuard } from '@/src/components/auth/auth-guard';
import { Layout } from '@/src/components/layout/layout';

export default function FacilityAdminDashboard() {
  return (
    <FacilityAdminGuard>
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              施設管理者ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">施設運営の管理と調整</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* シフト管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                シフト管理
              </h3>
              <p className="text-gray-600 mb-4">月間シフトの作成・編集・調整</p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                シフト管理へ
              </button>
            </div>

            {/* 役割表管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                役割表管理
              </h3>
              <p className="text-gray-600 mb-4">日々の業務配置と役割割り当て</p>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                役割表管理へ
              </button>
            </div>

            {/* 勤怠管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                勤怠管理
              </h3>
              <p className="text-gray-600 mb-4">職員の勤怠確認・承認・修正</p>
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                勤怠管理へ
              </button>
            </div>

            {/* 職員管理 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                職員管理
              </h3>
              <p className="text-gray-600 mb-4">職員情報の確認・更新</p>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                職員管理へ
              </button>
            </div>

            {/* シフト設定 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                シフト設定
              </h3>
              <p className="text-gray-600 mb-4">シフト形態・配置ルールの設定</p>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                設定管理へ
              </button>
            </div>

            {/* レポート */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                レポート
              </h3>
              <p className="text-gray-600 mb-4">勤怠・シフトの集計レポート</p>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                レポート表示へ
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </FacilityAdminGuard>
  );
}
