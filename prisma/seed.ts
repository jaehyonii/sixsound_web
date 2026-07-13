import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@sixsound.kr";
  const password = process.env.ADMIN_PASSWORD ?? "changeme1234";
  const name = process.env.ADMIN_NAME ?? "운영진";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name },
  });
  console.log(`✓ 운영진 계정 준비됨: ${email}`);

  // 동아리 소개 단일 레코드 보장
  await prisma.aboutContent.upsert({
    where: { id: "about" },
    update: {},
    create: {
      id: "about",
      body: "여섯소리(sixsound)는 클래식기타의 울림을 함께 나누는 동아리입니다.",
    },
  });
  console.log("✓ 동아리 소개 레코드 준비됨");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
