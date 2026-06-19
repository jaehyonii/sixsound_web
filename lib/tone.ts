// 포스터/썸네일 이미지가 없을 때 카드 배경으로 쓰는 결정적 우드톤 그라데이션.
// 같은 seed(연주회 id 등)는 항상 같은 톤을 받아 새로고침해도 색이 흔들리지 않는다.

const CONCERT_TONES = [
  "linear-gradient(160deg,#8a5a2b,#5e3d1d)", // wood
  "linear-gradient(160deg,#6d451f,#3a2614)", // deep
  "linear-gradient(160deg,#5c5333,#332f1d)", // olive
  "linear-gradient(160deg,#7a5a4a,#3d2c24)", // dusk
];

const VIDEO_TONES = [
  "linear-gradient(135deg,#3a322b,#241f1b)",
  "linear-gradient(140deg,#4a3a2a,#2a211a)",
  "linear-gradient(150deg,#5e3d1d,#2e2014)",
  "linear-gradient(135deg,#33312c,#201f1b)",
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function concertTone(seed: string): string {
  return CONCERT_TONES[hash(seed) % CONCERT_TONES.length];
}

export function videoTone(seed: string): string {
  return VIDEO_TONES[hash(seed) % VIDEO_TONES.length];
}
