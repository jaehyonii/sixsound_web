// 날짜 포맷 유틸. 서버/클라이언트 모두 동일 결과를 내도록 ko-KR 고정.
const dateFmt = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

const dateTimeFmt = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

export function formatDate(date: Date | string): string {
  return dateFmt.format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return dateTimeFmt.format(new Date(date));
}

export function getYear(date: Date | string): number {
  return new Date(date).getFullYear();
}

// <input type="date"> 의 기본값용. KST 기준 YYYY-MM-DD.
export function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(d);
  return parts; // en-CA → "YYYY-MM-DD"
}

// 카드/메타용 점 구분 날짜. KST 기준 "YYYY.MM.DD".
export function formatDateDot(date: Date | string): string {
  return toDateInput(date).replace(/-/g, ".");
}

// 공지 리스트용 "MM.DD".
export function formatMonthDay(date: Date | string): string {
  return toDateInput(date).slice(5).replace("-", ".");
}
