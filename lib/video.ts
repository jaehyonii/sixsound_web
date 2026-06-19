// 영상 소스 추상화 유틸리티.
//
// 이 파일과 components/video/VideoPlayer.tsx 두 곳이 "영상이 어디서 재생되는가"를
// 책임지는 유일한 지점이다. 차후 자체 호스팅/CDN으로 전환할 때는
//   1) Video.sourceType / sourceRef 데이터를 바꾸고
//   2) 아래 resolvePlayback() 과 VideoPlayer 의 분기를 채우면
// 된다. 페이지 코드는 손대지 않는다.

import type { VideoSourceType } from "@prisma/client";

export type PlaybackInfo =
  | { kind: "iframe"; src: string } // YouTube 등 임베드형
  | { kind: "file"; src: string } // <video> 태그형
  | { kind: "link"; href: string }; // 외부 링크형

/**
 * YouTube 링크/ID 어느 형태가 들어와도 11자리 video id를 추출한다.
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 * - https://www.youtube.com/shorts/ID
 * - 이미 ID만 들어온 경우 그대로 반환
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && /^[\w-]{11}$/.test(last)) return last;
    }
  } catch {
    // URL 파싱 실패 시 null
  }
  return null;
}

/** 재생에 필요한 정보를 sourceType/sourceRef 로부터 만들어낸다. */
export function resolvePlayback(
  sourceType: VideoSourceType,
  sourceRef: string,
): PlaybackInfo {
  switch (sourceType) {
    case "YOUTUBE": {
      const id = parseYouTubeId(sourceRef) ?? sourceRef;
      return {
        kind: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${id}`,
      };
    }
    case "FILE":
      // 미래: 자체 호스팅 파일. sourceRef = /uploads/videos/xxx.mp4 등
      return { kind: "file", src: sourceRef };
    case "EXTERNAL":
      return { kind: "link", href: sourceRef };
    default:
      return { kind: "link", href: sourceRef };
  }
}

/** 목록/카드에서 쓸 썸네일 URL. 명시값이 없으면 sourceType에서 유도한다. */
export function resolveThumbnail(
  sourceType: VideoSourceType,
  sourceRef: string,
  explicit?: string | null,
): string | null {
  if (explicit) return explicit;
  if (sourceType === "YOUTUBE") {
    const id = parseYouTubeId(sourceRef) ?? sourceRef;
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
  return null;
}
