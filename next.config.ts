import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 기본 1MB로는 휴대폰 카메라 사진(2~5MB)이 담긴 폼이 서버 액션에서 거부된다.
      // 부원 사진·연주회 포스터 업로드도 같은 제한에 걸리므로 함께 올린다.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
