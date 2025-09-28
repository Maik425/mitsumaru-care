export default function HomePage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <section className='mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-20 text-center'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-wide text-indigo-500'>
            みつまるケアとは
          </p>
          <h1 className='mt-4 text-4xl font-bold text-gray-900 sm:text-5xl'>
            介護施設の業務をまるごと効率化
          </h1>
          <p className='mt-6 text-lg leading-relaxed text-gray-700'>
            施設運営者・スタッフ・利用者をつなぐ統合プラットフォームです。
            <br className='hidden sm:block' />
            シフト管理や勤怠、利用者情報の共有まで、日々の業務をスマートにサポートします。
          </p>
        </div>

        <div className='grid w-full gap-6 text-left sm:grid-cols-3'>
          <div className='rounded-xl bg-white/80 p-6 shadow-sm backdrop-blur'>
            <h2 className='text-lg font-semibold text-gray-900'>
              柔軟なシフト管理
            </h2>
            <p className='mt-3 text-sm text-gray-600'>
              ドラッグ &
              ドロップで簡単にシフトを作成。配置の最適化も自動で提案します。
            </p>
          </div>
          <div className='rounded-xl bg-white/80 p-6 shadow-sm backdrop-blur'>
            <h2 className='text-lg font-semibold text-gray-900'>
              施設横断の情報共有
            </h2>
            <p className='mt-3 text-sm text-gray-600'>
              利用者メモや連絡事項をリアルタイムで共有。引き継ぎ漏れを防ぎます。
            </p>
          </div>
          <div className='rounded-xl bg-white/80 p-6 shadow-sm backdrop-blur'>
            <h2 className='text-lg font-semibold text-gray-900'>
              セキュアなアクセス
            </h2>
            <p className='mt-3 text-sm text-gray-600'>
              役割に応じた権限管理で、重要なデータを安全に保護します。
            </p>
          </div>
        </div>

        <div className='flex flex-col items-center gap-4'>
          <a
            href='/login'
            className='rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500'
          >
            ログインページへ
          </a>
          <p className='text-xs text-gray-500'>
            システム管理者からアカウント発行済みの方は、こちらからログインしてください。
          </p>
        </div>
      </section>
    </main>
  );
}
