/*!
 * STAGE WALK 방문 기록 (Supabase)
 * 아래 두 칸에 Supabase 프로젝트의 주소와 공개 키를 넣으면 기록이 시작돼요.
 *   - SUPABASE_URL      : Project Settings → API → Project URL   (예: https://abcd1234.supabase.co)
 *   - SUPABASE_ANON_KEY : Project Settings → API → anon public 키 (또는 publishable 키)
 * service_role(secret) 키는 절대 넣지 마세요. 공개 키는 브라우저에 노출돼도 되는 키예요.
 * 테이블과 함수는 supabase-setup.sql을 SQL Editor에서 한 번 실행하면 만들어져요.
 */
(function () {
  const SUPABASE_URL = '';
  const SUPABASE_ANON_KEY = '';

  const on = !!(SUPABASE_URL && SUPABASE_ANON_KEY) && /^https?:$/.test(location.protocol);
  const base = SUPABASE_URL.replace(/\/+$/, '');
  const headers = { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };

  // 브라우저마다 한 번 만드는 익명 방문자 번호 (개인정보 없음)
  let vid = '';
  try {
    vid = localStorage.getItem('sw_vid') || '';
    if (!vid) { vid = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)); localStorage.setItem('sw_vid', vid); }
  } catch (_) { vid = 'tmp-' + Math.random().toString(36).slice(2, 12); }

  const recent = {};
  // page: 'home' | 'inspire' | 'myunghwa',  path: '/'(페이지 열기) | 'seat/…' | 'booth/…' | 'view/…' | 'convert/…'
  function track(page, path) {
    if (!on) return;
    path = String(path || '/').slice(0, 80);
    const k = page + '|' + path, now = Date.now();
    if (recent[k] && now - recent[k] < 3000) return;   // 같은 기록을 3초 안에 두 번 보내지 않음
    recent[k] = now;
    try {
      fetch(base + '/rest/v1/page_views', {
        method: 'POST', keepalive: true,
        headers: Object.assign({ Prefer: 'return=minimal' }, headers),
        body: JSON.stringify({ page: String(page).slice(0, 20), path, visitor: vid.slice(0, 40), referrer: (document.referrer || '').slice(0, 200) })
      }).catch(() => {});
    } catch (_) {}
  }
  function rpc(fn, args) {
    if (!on) return Promise.resolve(null);
    try {
      return fetch(base + '/rest/v1/rpc/' + fn, { method: 'POST', headers, body: JSON.stringify(args || {}) })
        .then(r => (r.ok ? r.json() : null)).catch(() => null);
    } catch (_) { return Promise.resolve(null); }
  }
  window.SW = {
    on, track,
    stats: () => rpc('view_stats'),                                            // 페이지별 조회·방문자·오늘·좌석 조회
    count: (page, path) => rpc('path_count', { p_page: page, p_path: path }),  // 특정 화면(좌석 등) 조회수
    daily: days => rpc('daily_views', { p_days: days || 14 }),                 // 날짜별 페이지 조회
    top: (page, prefix, n) => rpc('top_paths', { p_page: page, p_prefix: prefix, p_limit: n || 10 })
  };
})();
