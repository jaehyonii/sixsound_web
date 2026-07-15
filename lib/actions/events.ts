"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { optDate, optStr, reqDate, str } from "./util";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");
}

function refresh() {
  revalidatePath("/admin/events");
  revalidatePath("/schedule");
  revalidatePath("/");
}

function readFields(formData: FormData) {
  return {
    title: str(formData.get("title")),
    startAt: reqDate(formData.get("startAt")),
    endAt: optDate(formData.get("endAt")),
    location: optStr(formData.get("location")),
    description: optStr(formData.get("description")),
  };
}

export async function createEvent(formData: FormData) {
  await requireAuth();
  await prisma.event.create({ data: readFields(formData) });
  refresh();
  redirect("/admin/events");
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAuth();
  await prisma.event.update({ where: { id }, data: readFields(formData) });
  refresh();
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAuth();
  await prisma.event.delete({ where: { id } });
  refresh();
  redirect("/admin/events");
}
