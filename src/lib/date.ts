const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatBlogDate(dateInput: string | number | Date) {
  const date =
    typeof dateInput === "string" || typeof dateInput === "number"
      ? new Date(dateInput)
      : dateInput;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return BLOG_DATE_FORMATTER.format(date);
}


