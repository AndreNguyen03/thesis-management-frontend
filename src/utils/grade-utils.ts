
export function getGradeText(score: number): string {
  if (score >= 9) return "Xuất sắc"
  if (score >= 8) return "Giỏi"
  if (score >= 7) return "Khá"
  if (score >= 5) return "Trung bình"
  return "Chưa đạt"
}

export function getGradeColor(score: number): string {
  if (score >= 9) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  if (score >= 8) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  if (score >= 7) return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
  if (score >= 5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
}
