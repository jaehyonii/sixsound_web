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
  const generation = toInt(formData.get("generation"));
  // 순서는 폼에서 받지 않는다. 새 집행부는 해당 기수의 맨 뒤에 붙이고,
  // 이후 관리자 목록에서 드래그로 순서를 바꾼다.
  const sortOrder = await prisma.executive.count({ where: { generation } });

  await prisma.executive.create({
    data: {
      generation,
      title: str(formData.get("title")),
      memberId: str(formData.get("memberId")),
      sortOrder,
    },
  });
  refresh();
  redirect("/admin/executives");
}

export async function updateExecutive(id: string, formData: FormData) {
  await requireAuth();
  const existing = await prisma.executive.findUnique({ where: { id } });
  const generation = toInt(formData.get("generation"));

  // 기수를 옮긴 경우에만 새 기수의 맨 뒤로 보낸다. 같은 기수면 기존 순서를 유지.
  const movedToOtherGeneration =
    !!existing && existing.generation !== generation;
  const sortOrder = movedToOtherGeneration
    ? await prisma.executive.count({ where: { generation } })
    : undefined;

  await prisma.executive.update({
    where: { id },
    data: {
      generation,
      title: str(formData.get("title")),
      memberId: str(formData.get("memberId")),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
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

/** 관리자 목록에서 드래그로 바뀐 순서를 저장한다. ids는 같은 기수 안의 새 순서. */
export async function reorderExecutives(ids: string[]) {
  await requireAuth();
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.executive.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  refresh();
}
