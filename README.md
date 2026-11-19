# STAGE WALK · 라이브홀 & 아레나 메타버스

공연장 두 곳을 1인칭 3D로 걸어 보고, 좌석마다 시야를 미리 확인하는 디지털 마케팅 수업용 컨셉 프로토타입입니다.

- `index.html` — 시작 페이지 (공연장 선택 · 비교)
- `inspire.html` — 인스파이어 아레나 메타버스 (좌석표 착석, W/S/A/D로 옮겨 앉기, 4분할 시야, 방문자 행동 지표)
- `myunghwa.html` — 명화라이브홀 메타버스 (제작: 박진우, 경기대학교 경영학과 · 원본에 '← 공연장' 버튼만 추가)

## 보는 방법
GitHub Pages를 켜면 `https://<계정>.github.io/<저장소>/` 주소로 열립니다.
(Settings → Pages → Branch: `main` / `/ (root)` → Save)

## 안내
- 비공식 학생 프로젝트이며 인스파이어 및 명화라이브홀과 무관합니다.
- 공연명(NEON TIDE), 구역 번호, 가격은 모두 예시이며 실제 예매는 되지 않습니다.
- 3D 렌더링: three.js r128 (cdnjs), 글꼴: Noto Sans KR · Orbit (Google Fonts)

## 방문 통계 (Supabase)
- 각 페이지가 열릴 때, 좌석·부스·시점을 볼 때 Supabase `page_views` 테이블에 기록이 쌓여요.
- `stats.html` — 페이지별 조회수·방문자·오늘 조회, 최근 14일 그래프, 가장 많이 본 좌석
- 켜는 방법
  1. supabase.com에서 무료 프로젝트 만들기
  2. SQL Editor에서 `supabase-setup.sql` 실행
  3. `sw-stats.js` 맨 위 `SUPABASE_URL`, `SUPABASE_ANON_KEY`에 Project URL과 anon(공개) 키 입력
- 원본 기록은 공개되지 않고(RLS), 집계 숫자만 함수로 읽을 수 있어요. service_role 키는 절대 넣지 마세요.
