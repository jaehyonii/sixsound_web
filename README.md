# 여섯소리 (sixsound) 웹사이트

클래식기타 동아리 **여섯소리**의 공식 웹사이트입니다.
핵심 기능은 **연주회 영상 아카이브**이며, 운영진이 관리자 페이지에서 콘텐츠를 직접 관리합니다.

## 기술 스택

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** + **Prisma** ORM
- **Auth.js (NextAuth v5)** — 운영진 계정 로그인
- **Tailwind CSS v4**
- **Docker / docker-compose** — 자체 서버 배포

## 주요 기능

| 영역 | 내용 |
|---|---|
| 연주회 아카이브 | 연주회별로 여러 영상을 등록, 연도 필터, 상세 페이지에서 임베드 재생 |
| 영상 추상화 | YouTube로 시작하되 차후 자체 호스팅/외부 링크로 교체 가능 (아래 참고) |
| 동아리 소개 / 부원(기수별) / 공지·일정 | 공개 페이지 + 관리자 편집 |
| 관리자 | 운영진 로그인 후 모든 콘텐츠 CRUD, 포스터·사진 업로드 |

## 영상 추상화 (중요)

영상의 "어디서 재생되는가"는 **두 파일에만** 존재합니다.

- `lib/video.ts` — `resolvePlayback()` / `resolveThumbnail()`
- `components/video/VideoPlayer.tsx` — 실제 렌더링

DB의 `Video.sourceType`(`YOUTUBE` | `FILE` | `EXTERNAL`)과 `sourceRef`로 소스를 구분합니다.
**페이지 코드는 영상 태그를 직접 다루지 않으므로**, 나중에 직접 호스팅으로 전환할 때는
위 두 파일의 `FILE` 분기를 채우고 데이터를 바꾸면 됩니다. 페이지는 수정할 필요가 없습니다.

YouTube는 `https://youtu.be/ID`, `watch?v=ID`, `embed/ID`, 11자리 ID 등 어떤 형태로 넣어도
자동 인식됩니다. 썸네일은 YouTube ID에서 자동 유도되어 별도 업로드가 필요 없습니다.

---

## 로컬 개발

전제: Node 20+ (권장 24), Docker.

```bash
# 1) 의존성
npm install

# 2) 개발용 PostgreSQL (예: 5433 포트)
docker run -d --name sixsound-pg-dev \
  -e POSTGRES_USER=sixsound -e POSTGRES_PASSWORD=sixsound -e POSTGRES_DB=sixsound \
  -p 5433:5432 postgres:16-alpine

# 3) 환경변수
cp .env.example .env
#   DATABASE_URL 의 포트를 5433 으로 맞추고, AUTH_SECRET 을 채운다.
#   AUTH_SECRET 생성: openssl rand -base64 32

# 4) DB 준비 + 시드(운영진 계정 생성)
npx prisma migrate dev
npx prisma db seed

# 5) 개발 서버
npm run dev        # http://localhost:3000
```

기본 운영진 계정은 `.env`의 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 입니다.
`/admin/login` 에서 로그인하세요.

유용한 스크립트:

```bash
npm run db:migrate   # prisma migrate dev
npm run db:seed      # 운영진 계정·소개 레코드 보장(멱등)
npm run db:studio    # Prisma Studio (DB GUI)
npm run build        # 프로덕션 빌드
```

---

## 자체 서버 배포 (Docker)

서버에 코드를 올린 뒤:

```bash
# 1) 환경변수 작성
cp .env.example .env
#   - AUTH_SECRET: openssl rand -base64 32 로 생성한 긴 무작위 값 (필수)
#   - ADMIN_EMAIL / ADMIN_PASSWORD: 최초 운영진 계정
#   - (선택) POSTGRES_PASSWORD, APP_PORT 등

# 2) 빌드 + 기동 (DB 포함)
docker compose up -d --build
```

- 앱 컨테이너는 시작 시 **자동으로 마이그레이션과 시드**를 수행합니다
  (`docker-entrypoint.sh`).
- 기본 포트는 `3000`입니다. 호스트에서 이미 사용 중이면
  `.env`에 `APP_PORT=8080` 처럼 지정하세요 (`8080:3000` 으로 매핑됩니다).
- 데이터는 도커 볼륨에 영속됩니다:
  - `db_data` — PostgreSQL 데이터
  - `uploads` — 업로드된 포스터·부원 사진 (`/app/public/uploads`)

리버스 프록시(nginx 등)로 도메인·HTTPS를 붙일 때는 앱 포트로 프록시하고,
도메인 환경에서는 `AUTH_TRUST_HOST=true`(compose에 이미 설정됨)가 필요합니다.

운영 명령:

```bash
docker compose logs -f app      # 로그
docker compose down             # 중지 (데이터 유지)
docker compose down -v          # 중지 + 데이터 삭제(주의)
docker compose up -d --build    # 코드 갱신 후 재배포
```

### 운영진 비밀번호 변경

시드는 멱등이라 기존 계정 비밀번호를 덮어쓰지 않습니다. 변경하려면 Prisma Studio
(`npm run db:studio`)로 `passwordHash`를 교체하거나, 별도 사용자 추가 스크립트를 사용하세요.

---

## 디렉터리 구조

```
app/
  (site)/        # 공개 페이지 (홈, archive, about, members, notices)
  admin/         # 관리자 (login + (dashboard) 그룹)
  api/auth/      # Auth.js 라우트
components/
  video/VideoPlayer.tsx   # ★ 영상 재생 진입점
  layout/ , ui/ , admin/
lib/
  prisma.ts, video.ts, auth-actions.ts, format.ts
  actions/       # 서버 액션 (CRUD)
prisma/
  schema.prisma, seed.ts, migrations/
auth.ts, auth.config.ts, proxy.ts   # 인증 + /admin 보호
Dockerfile, docker-compose.yml, docker-entrypoint.sh
```
