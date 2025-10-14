// Simple base64 password utilities - no external auth library needed
export function base64Encode(str: string): string {
  return Buffer.from(str).toString("base64");
}

export function base64Decode(str: string): string {
  return Buffer.from(str, "base64").toString("utf8");
}

export function verifyBase64Password(inputPassword: string, storedHash: string): boolean {
  const decodedStored = base64Decode(storedHash);
  return inputPassword === decodedStored;
}
