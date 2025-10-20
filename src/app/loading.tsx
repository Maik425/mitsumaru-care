export default function Loading() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <div className='text-center'>
        <div className='mx-auto mb-4 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          読み込み中...
        </h2>
        <p className='text-gray-600'>しばらくお待ちください</p>
      </div>
    </div>
  );
}
