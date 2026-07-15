"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { bool, str } from "./util";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");
}

function refresh() {
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/");
}

export async function createNotice(formData: FormData) {
  await requireAuth();
  await prisma.notice.create({
    data: {
      title: str(formData.get("title")),
      content: str(formData.get("content")),
      isPinned: bool(formData.get("isPinned")),
    },
  });
  refresh();
  redirect("/admin/notices");
}

export async function updateNotice(id: string, formData: FormData) {
  await requireAuth();
  await prisma.notice.update({
    where: { id },
    data: {
      title: str(formData.get("title")),
      content: str(formData.get("content")),
      isPinned: bool(formData.get("isPinned")),
    },
  });
  refresh();
  redirect("/admin/notices");
}

export async function deleteNotice(id: string) {
  await requireAuth();
  await prisma.notice.delete({ where: { id } });
  refresh();
  redirect("/admin/notices");
}
