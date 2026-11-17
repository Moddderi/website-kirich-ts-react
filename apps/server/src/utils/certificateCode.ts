import { randomBytes } from "node:crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateElectronicCertificateCode = (): string => {
  const bytes = randomBytes(8);
  const chunk = (offset: number) =>
    Array.from({ length: 4 }, (_, i) => {
      const idx = bytes[offset + i] % CODE_ALPHABET.length;
      return CODE_ALPHABET[idx];
    }).join("");
  return `KIR-${chunk(0)}-${chunk(4)}`;
};

export const normalizeElectronicCertificateCode = (raw: string) =>
  raw.trim().toUpperCase();