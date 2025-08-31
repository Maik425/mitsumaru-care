import { StaffGuard } from '@/src/components/auth/auth-guard';

export default function StaffDashboard() {
  return (
    <StaffGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              職員ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">勤怠管理とシフト確認</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* シフト確認 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                シフト確認
              </h3>
              <p className="text-gray-600 mb-4">自分の勤務予定を確認</p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                シフト表示へ
              </button>
            </div>

            {/* 勤怠入力 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                勤怠入力
              </h3>
              <p className="text-gray-600 mb-4">出勤・退勤の打刻と修正</p>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                勤怠入力へ
              </button>
            </div>

            {/* 休暇申請 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                休暇申請
              </h3>
              <p className="text-gray-600 mb-4">有給・特別休暇の申請</p>
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
                休暇申請へ
              </button>
            </div>

            {/* 勤怠履歴 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                勤怠履歴
              </h3>
              <p className="text-gray-600 mb-4">過去の勤怠記録を確認</p>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                履歴表示へ
              </button>
            </div>

            {/* 役割確認 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                役割確認
              </h3>
              <p className="text-gray-600 mb-4">当日の担当業務を確認</p>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                役割表示へ
              </button>
            </div>

            {/* 個人設定 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                個人設定
              </h3>
              <p className="text-gray-600 mb-4">プロフィール・パスワード変更</p>
              <button className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
                設定変更へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </StaffGuard>
  );
}
