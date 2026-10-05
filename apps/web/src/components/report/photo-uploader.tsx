"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import { MAX_UPLOAD_PHOTOS, type PhotoEntry } from "@/hooks/use-upload";

export interface PhotoUploaderProps {
  value: PhotoEntry[];
  max?: number;
  required?: boolean;
  limitReached?: boolean;
  onChange: (files: File[]) => void;
  onRemove?: (localId: string) => void;
  onRetry?: (localId: string) => void;
}

export function PhotoUploader({
  value,
  max = MAX_UPLOAD_PHOTOS,
  required = false,
  limitReached = false,
  onChange,
  onRemove,
  onRetry,
}: PhotoUploaderProps) {
  const t = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const readyCount = value.filter((entry) => entry.phase === "ready").length;
  const isFull = value.length >= max;
  const showRequired = required && readyCount === 0;

  function errorMessage(entry: PhotoEntry): string {
    if (entry.phase === "rejected") return t("report.wizard.photos.rejected");
    if (entry.errorCode === "OFFLINE") return t("common.offline");
    if (entry.errorCode !== null) return t(`error.${entry.errorCode}`);
    return "";
  }

  function statusText(entry: PhotoEntry): string | null {
    if (entry.phase === "uploading") {
      const progress = entry.progress !== null ? ` ${entry.progress}%` : "";
      return `${t("report.wizard.photos.uploading")}${progress}`;
    }
    if (entry.phase === "processing") return t("report.wizard.photos.processing");
    if (entry.phase === "ready") {
      return entry.thumbUrl !== null
        ? t("report.wizard.photos.ready")
        : t("report.wizard.photos.restored");
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        data-testid="photo-uploader-add"
        disabled={isFull}
        onClick={() => inputRef.current?.click()}
        className="w-fit min-h-11 rounded-md border border-border px-4 py-2 text-sm text-text disabled:opacity-50"
      >
        {t("report.wizard.photos.add")}
      </button>
      <input
        ref={inputRef}
        type="file"
        data-testid="photo-uploader-input"
        aria-label={t("report.wizard.photos.add")}
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        disabled={isFull}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) onChange(files);
          event.target.value = "";
        }}
      />

      {isFull || limitReached ? (
        <p data-testid="photo-uploader-limit" role="status" className="text-sm text-text-muted">
          {t("error.UPLOAD_LIMIT_REACHED")}
        </p>
      ) : null}

      {showRequired ? (
        <p data-testid="photo-uploader-required" className="text-sm text-text-muted">
          {t("report.wizard.photos.required")}
        </p>
      ) : null}

      {value.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {value.map((entry, index) => {
            const isBusy = entry.phase === "uploading" || entry.phase === "processing";
            const status = statusText(entry);
            const hasError = entry.phase === "failed" || entry.phase === "rejected";
            return (
              <li
                key={entry.localId}
                data-testid={`photo-uploader-item-${index}`}
                aria-busy={isBusy}
                aria-describedby={hasError ? `${entry.localId}-error` : undefined}
                className="rounded-md border border-border p-2"
              >
                <div className="flex items-center gap-3">
                  {entry.thumbUrl !== null ? (
                    <img
                      src={entry.thumbUrl}
                      alt=""
                      className="h-12 w-12 rounded-sm bg-surface-muted object-cover"
                    />
                  ) : (
                    <div aria-hidden="true" className="h-12 w-12 rounded-sm bg-surface-muted" />
                  )}
                  <span
                    data-testid={`photo-uploader-status-${index}`}
                    role={status !== null ? "status" : undefined}
                    className="flex-1 text-sm text-text-muted"
                  >
                    {status}
                  </span>
                  {entry.phase === "failed" && onRetry ? (
                    <button
                      type="button"
                      data-testid={`photo-uploader-retry-${index}`}
                      onClick={() => onRetry(entry.localId)}
                      className="min-h-11 rounded-md border border-border px-3 py-1 text-sm text-text"
                    >
                      {t("report.wizard.photos.retry")}
                    </button>
                  ) : null}
                  {onRemove ? (
                    <button
                      type="button"
                      data-testid={`photo-uploader-remove-${index}`}
                      aria-label={t("report.wizard.photos.remove")}
                      onClick={() => onRemove(entry.localId)}
                      className="min-h-11 rounded-md border border-border px-3 py-1 text-sm text-text"
                    >
                      {t("report.wizard.photos.remove")}
                    </button>
                  ) : null}
                </div>
                {hasError ? (
                  <p
                    id={`${entry.localId}-error`}
                    data-testid={`photo-uploader-error-${index}`}
                    role="alert"
                    className="mt-2 text-sm text-text-muted"
                  >
                    {entry.fileName ? `${entry.fileName} — ` : ""}
                    {errorMessage(entry)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
