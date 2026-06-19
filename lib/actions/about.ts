"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { str } from "./util";

export async function updateAbout(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");

  const body = str(formData.get("body"));
  await prisma.aboutContent.upsert({
    where: { id: "about" },
    update: { body },
    create: { id: "about", body },
  });
  revalidatePath("/about");
  revalidatePath("/admin/about");
}
