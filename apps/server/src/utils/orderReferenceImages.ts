export const readReferenceImageUrls = (order: {
  estimate?: { referenceImageUrls?: unknown } | null;
}): string[] => {
  const raw = order.estimate?.referenceImageUrls;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (u): u is string =>
        typeof u === "string" && /^https:\/\/res\.cloudinary\.com\//i.test(u),
    )
    .slice(0, 5);
};