const CLOUDINARY_UPLOAD_SEGMENT = "/image/upload/";

export function optimizeCloudinaryUrl(
  url: string,
  options: { width?: number } = {},
): string {
  const { width = 500 } = options;

  if (
    !url.includes("res.cloudinary.com") ||
    !url.includes(CLOUDINARY_UPLOAD_SEGMENT)
  ) {
    return url;
  }

  const segmentIndex = url.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
  const afterUpload = url.slice(
    segmentIndex + CLOUDINARY_UPLOAD_SEGMENT.length,
  );

  if (/^w_\d+/.test(afterUpload)) {
    return url;
  }

  const transforms = `w_${width},q_auto,f_auto,c_fill`;
  return `${url.slice(0, segmentIndex + CLOUDINARY_UPLOAD_SEGMENT.length)}${transforms}/${afterUpload}`;
}
