/* Simple SW for offline test routes */
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate' && url.pathname === '/admin/shifts') {
    event.respondWith(
      (async () => {
        try {
          const resp = await fetch(event.request);
          return resp;
        } catch (e) {
          const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>オフライン</title></head><body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
          <main style="padding:16px">
            <h1 style="font-size:20px; margin:0 0 12px;">シフト管理</h1>
            <button id="create" style="padding:8px 12px; border:1px solid #ddd; border-radius:6px; background:#fff;">シフト作成</button>
            <div id="msg" style="margin-top:12px; color:#ef4444;"></div>
          </main>
          <script>
            var m = document.getElementById('msg');
            m.textContent = 'ネットワークエラー: 接続できません';
            document.getElementById('create').addEventListener('click', function(){
              m.textContent = 'ネットワークエラー: 接続できません';
            });
          </script>
        </body></html>`;
          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
      })()
    );
  }
});
