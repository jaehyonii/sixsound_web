"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { VideoSourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { optStr, reqDate, saveUpload, str, toInt } from "./util";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("권한이 없습니다.");
}

function refresh(concertId?: string) {
  revalidatePath("/admin/concerts");
  revalidatePath("/archive");
  revalidatePath("/");
  if (concertId) {
    revalidatePath(`/admin/concerts/${concertId}`);
    revalidatePath(`/archive/${concertId}`);
  }
}

export async function createConcert(formData: FormData) {
  await requireAuth();
  const posterUrl = await saveUpload(formData.get("poster"));
  const concert = await prisma.concert.create({
    data: {
      title: str(formData.get("title")),
      performedAt: reqDate(formData.get("performedAt")),
      venue: optStr(formData.get("venue")),
      description: optStr(formData.get("description")),
      posterUrl,
    },
  });
  refresh(concert.id);
  redirect(`/admin/concerts/${concert.id}`);
}

export async function updateConcert(id: string, formData: FormData) {
  await requireAuth();
  const posterUrl = await saveUpload(formData.get("poster"));
  await prisma.concert.update({
    where: { id },
    data: {
      title: str(formData.get("title")),
      performedAt: reqDate(formData.get("performedAt")),
      venue: optStr(formData.get("venue")),
      description: optStr(formData.get("description")),
      // 새 포스터를 올린 경우에만 교체
      ...(posterUrl ? { posterUrl } : {}),
    },
  });
  refresh(id);
}

export async function deleteConcert(id: string) {
  await requireAuth();
  await prisma.concert.delete({ where: { id } }); // 영상은 cascade 삭제
  refresh(id);
  redirect("/admin/concerts");
}

export async function addVideo(concertId: string, formData: FormData) {
  await requireAuth();
  const count = await prisma.video.count({ where: { concertId } });
  await prisma.video.create({
    data: {
      concertId,
      title: str(formData.get("title")),
      pieceTitle: optStr(formData.get("pieceTitle")),
      composer: optStr(formData.get("composer")),
      performers: optStr(formData.get("performers")),
      sourceType: (str(formData.get("sourceType")) ||
        "YOUTUBE") as VideoSourceType,
      sourceRef: str(formData.get("sourceRef")),
      sortOrder: count,
    },
  });
  refresh(concertId);
}

export async function updateVideo(videoId: string, formData: FormData) {
  await requireAuth();
  const video = await prisma.video.update({
    where: { id: videoId },
    data: {
      title: str(formData.get("title")),
      pieceTitle: optStr(formData.get("pieceTitle")),
      composer: optStr(formData.get("composer")),
      performers: optStr(formData.get("performers")),
      sourceType: (str(formData.get("sourceType")) ||
        "YOUTUBE") as VideoSourceType,
      sourceRef: str(formData.get("sourceRef")),
      sortOrder: toInt(formData.get("sortOrder")),
    },
  });
  refresh(video.concertId);
}

export async function deleteVideo(videoId: string) {
  await requireAuth();
  const video = await prisma.video.delete({ where: { id: videoId } });
  refresh(video.concertId);
}
