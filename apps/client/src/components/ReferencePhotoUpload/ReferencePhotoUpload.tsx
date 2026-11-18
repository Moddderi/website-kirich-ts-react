import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuImagePlus, LuLoaderCircle, LuX } from "react-icons/lu";
import { uploadOrderReferenceImage } from "../../api/referenceImageApi";

const MAX_FILES = 5;
const ACCEPT = "image/jpeg,image/png,image/webp";

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

export const ReferencePhotoUpload = ({ urls, onChange, disabled }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAdd = urls.length < MAX_FILES && !uploading && !disabled;

  const onPick = async (fileList: FileList | null) => {
    if (!fileList?.length || !canAdd) return;
    setError(null);

    const slots = MAX_FILES - urls.length;
    const files = Array.from(fileList).slice(0, slots);
    const next = [...urls];
    setUploading(true);

    try {
      for (const file of files) {
        try {
          const url = await uploadOrderReferenceImage(file);
          next.push(url);
          onChange([...next]);
        } catch (err) {
          const code = err instanceof Error ? err.message : "";
          if (code === "invalid_type" || code === "too_large") {
            setError(t("checkout.referencePhotoErrorFormat"));
          } else if (axiosMessage(err)) {
            setError(axiosMessage(err)!);
          } else {
            setError(t("checkout.referencePhotoErrorUpload"));
          }
          break;
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className="mt-6 border-t border-stone-100 pt-6">
      <h3 className="text-sm font-semibold tracking-tight text-stone-900">
        {t("checkout.referencePhotoTitle")}
      </h3>
      <p className="mt-1 text-xs font-medium text-stone-400">
        {t("checkout.referencePhotoHint", { max: MAX_FILES })}
      </p>

      {urls.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {urls.map((url, index) => (
            <li key={url} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-stone-200">
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled || uploading}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900/75 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                aria-label={t("checkout.referencePhotoRemove")}
              >
                <LuX size={14} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => void onPick(e.target.files)}
          />
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => inputRef.current?.click()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50/80 py-3.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50"
          >
            {uploading ? (
              <LuLoaderCircle className="animate-spin" size={20} />
            ) : (
              <LuImagePlus size={20} strokeWidth={1.6} />
            )}
            {uploading
              ? t("checkout.referencePhotoUploading")
              : t("checkout.referencePhotoAdd")}
          </button>
        </>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const axiosMessage = (err: unknown): string | null => {
  if (typeof err !== "object" || err === null || !("response" in err)) return null;
  const data = (err as { response?: { data?: { message?: string } } }).response?.data;
  return typeof data?.message === "string" ? data.message : null;
};