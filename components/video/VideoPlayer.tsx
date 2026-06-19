// 영상 재생의 유일한 진입점.
// 페이지/컴포넌트 어디에서도 <iframe>/<video>를 직접 쓰지 말고 반드시 이 컴포넌트를 통한다.
// 차후 자체 호스팅 전환 시 lib/video.ts 의 resolvePlayback 과 이 파일의 분기만 채우면 된다.

import type { VideoSourceType } from "@prisma/client";
import { resolvePlayback } from "@/lib/video";

type Props = {
  sourceType: VideoSourceType;
  sourceRef: string;
  title?: string;
};

export function VideoPlayer({ sourceType, sourceRef, title }: Props) {
  const playback = resolvePlayback(sourceType, sourceRef);

  if (playback.kind === "iframe") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={playback.src}
          title={title ?? "연주 영상"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  if (playback.kind === "file") {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <video
          className="absolute inset-0 h-full w-full"
          src={playback.src}
          controls
          playsInline
        />
      </div>
    );
  }

  // 외부 링크형
  return (
    <a
      href={playback.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video w-full items-center justify-center rounded-lg bg-neutral-100 text-sm font-medium text-neutral-700 hover:bg-neutral-200"
    >
      외부 사이트에서 영상 보기 ↗
    </a>
  );
}
