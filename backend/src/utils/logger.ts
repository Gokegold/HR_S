export function log(...args: any[]) {
  if (process.env.NODE_ENV === "test") return;
  console.log("[hr-attendance]", ...args);
}