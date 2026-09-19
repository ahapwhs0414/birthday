# 예진이 생일 축하 사이트

모바일에서 스토리, 생일 퀴즈, 준비물 게임을 진행하고 축하 메시지를 남기는 Next.js 프로토타입입니다.

## 로컬 실행

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Supabase 설정

1. `supabase/migrations/20260917000000_initial.sql`을 적용합니다.
2. Supabase Auth에 예진이 소유자 계정을 만든 후 주석의 예시대로 `recipients` 행을 추가합니다.
3. `.env.local`에 Supabase URL, anon key, 서버 전용 service role key, `OWNER_EMAIL`을 설정합니다.
4. `/admin`은 로그인한 사용자 이메일과 `OWNER_EMAIL`이 일치할 때만 최신순 기록을 표시합니다.

서비스 역할 키는 절대 `NEXT_PUBLIC_` 접두사로 만들거나 브라우저 코드에 넣지 마세요.

## 검증

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
