"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { str, toInt } from "./util";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");
}

function refresh() {
  revalidatePath("/admin/executives");
  revalidatePath("/executives");
}

export async function createExecutive(formData: FormData) {
  await requireAuth();
  await prisma.executive.create({
    data: {
      generation: toInt(formData.get("generation")),
      title: str(formData.get("title")),
      memberId: str(formData.get("memberId")),
      sortOrder: toInt(formData.get("sortOrder")),
    },
  });
  refresh();
  redirect("/admin/executives");
}

export async function updateExecutive(id: string, formData: FormData) {
  await requireAuth();
  await prisma.executive.update({
    where: { id },
    data: {
      generation: toInt(formData.get("generation")),
      title: str(formData.get("title")),
      memberId: str(formData.get("memberId")),
      sortOrder: toInt(formData.get("sortOrder")),
    },
  });
  refresh();
  redirect("/admin/executives");
}

export async function deleteExecutive(id: string) {
  await requireAuth();
  await prisma.executive.delete({ where: { id } });
  refresh();
  redirect("/admin/executives");
}
