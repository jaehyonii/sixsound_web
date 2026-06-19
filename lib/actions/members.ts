"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { bool, optStr, saveUpload, str, toInt } from "./util";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");
}

function refresh() {
  revalidatePath("/admin/members");
  revalidatePath("/members");
}

export async function createMember(formData: FormData) {
  await requireAuth();
  const photoUrl = await saveUpload(formData.get("photo"));
  await prisma.member.create({
    data: {
      name: str(formData.get("name")),
      generation: toInt(formData.get("generation")),
      part: optStr(formData.get("part")),
      bio: optStr(formData.get("bio")),
      isActive: bool(formData.get("isActive")),
      sortOrder: toInt(formData.get("sortOrder")),
      photoUrl,
    },
  });
  refresh();
  redirect("/admin/members");
}

export async function updateMember(id: string, formData: FormData) {
  await requireAuth();
  const photoUrl = await saveUpload(formData.get("photo"));
  await prisma.member.update({
    where: { id },
    data: {
      name: str(formData.get("name")),
      generation: toInt(formData.get("generation")),
      part: optStr(formData.get("part")),
      bio: optStr(formData.get("bio")),
      isActive: bool(formData.get("isActive")),
      sortOrder: toInt(formData.get("sortOrder")),
      ...(photoUrl ? { photoUrl } : {}),
    },
  });
  refresh();
  redirect("/admin/members");
}

export async function deleteMember(id: string) {
  await requireAuth();
  await prisma.member.delete({ where: { id } });
  refresh();
  redirect("/admin/members");
}
