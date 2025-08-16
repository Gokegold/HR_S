// small helper wrappers (optional) — currently not required by controller but included for completeness
export function decodeBase64urlToBuffer(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}