#!/bin/sh
set -e

echo "▶ DB 마이그레이션 적용 (prisma migrate deploy)…"
npx prisma migrate deploy

echo "▶ 초기 데이터 시드 (운영진 계정·소개 레코드, 멱등)…"
npx prisma db seed || echo "  시드 건너뜀"

echo "▶ 앱 시작"
exec "$@"
