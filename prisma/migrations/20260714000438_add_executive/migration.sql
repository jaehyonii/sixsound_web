-- 집행부(기수별 임원) 테이블
CREATE TABLE "Executive" (
    "id" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Executive_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Executive_generation_idx" ON "Executive"("generation");

ALTER TABLE "Executive" ADD CONSTRAINT "Executive_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
