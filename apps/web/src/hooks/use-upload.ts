import { useCallback, useRef, useState } from "react";

import { api } from "@/lib/api/client";

// Client-side mirror of the BE-10 limits; the server stays authoritative.
export const ALLOWED_UPLOAD_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_UPLOAD_PHOTOS = 5;

export type PhotoPhase = "uploading" | "processing" | "ready" | "rejected" | "failed";

// Client-side phases are a superset of the contract UploadState (FE-03 CMP-011).
export interface PhotoEntry {
  localId: string;
  fileName: string;
  phase: PhotoPhase;
  progress: number | null;
  uploadId: string | null;
  thumbUrl: string | null;
  errorCode: string | null;
  idempotencyKey: string;
}

export interface UseUploadOptions {
  max?: number;
}

export interface UseUploadResult {
  entries: PhotoEntry[];
  readyIds: string[];
  inFlight: boolean;
  limitReached: boolean;
  addFiles: (files: File[] | FileList) => void;
  remove: (localId: string) => void;
  retry: (localId: string) => void;
  rehydrate: (imageIds: string[]) => void;
  reset: () => void;
}

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function localRejection(file: File): string | null {
  if (!ALLOWED_UPLOAD_MIME.includes(file.type)) return "UPLOAD_INVALID_TYPE";
  if (file.size > MAX_UPLOAD_BYTES) return "UPLOAD_TOO_LARGE";
  return null;
}

function putPresigned(
  url: string,
  file: File,
  mime: string,
  onProgress: (percent: number) => void,
): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", mime);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.onabort = () => resolve(false);
    xhr.send(file);
  });
}

export function useUpload(options: UseUploadOptions = {}): UseUploadResult {
  const max = options.max ?? MAX_UPLOAD_PHOTOS;
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [limitReached, setLimitReached] = useState(false);
  const filesRef = useRef(new Map<string, File>());

  const patch = useCallback((localId: string, next: Partial<PhotoEntry>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.localId === localId ? { ...entry, ...next } : entry)),
    );
  }, []);

  const runUpload = useCallback(
    async (localId: string, file: File, idempotencyKey: string) => {
      patch(localId, { phase: "uploading", progress: null, errorCode: null });

      let uploadId: string;
      let uploadUrl: string;
      try {
        const init = await api.POST("/api/v1/uploads", {
          body: { mime: file.type, sizeBytes: file.size },
          headers: { "X-Requested-With": "temuunair", "Idempotency-Key": idempotencyKey },
        });
        if (init.error) {
          patch(localId, { phase: "failed", errorCode: init.error.error.code ?? "INTERNAL" });
          return;
        }
        uploadId = init.data.uploadId;
        uploadUrl = init.data.uploadUrl;
      } catch {
        patch(localId, { phase: "failed", errorCode: "OFFLINE" });
        return;
      }

      const ok = await putPresigned(uploadUrl, file, file.type, (percent) =>
        patch(localId, { progress: percent }),
      );
      if (!ok) {
        patch(localId, { phase: "failed", errorCode: "OFFLINE" });
        return;
      }

      patch(localId, { phase: "processing", progress: null });
      try {
        const complete = await api.POST("/api/v1/uploads/{id}/complete", {
          params: { path: { id: uploadId } },
          headers: { "X-Requested-With": "temuunair" },
        });
        if (complete.error) {
          patch(localId, { phase: "failed", errorCode: complete.error.error.code ?? "INTERNAL" });
          return;
        }
        if (complete.data.status === "READY") {
          patch(localId, {
            phase: "ready",
            uploadId: complete.data.id,
            thumbUrl: complete.data.thumbUrl ?? null,
          });
        } else {
          patch(localId, { phase: "rejected" });
        }
      } catch {
        patch(localId, { phase: "failed", errorCode: "OFFLINE" });
      }
    },
    [patch],
  );

  const addFiles = useCallback(
    (incoming: File[] | FileList) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;

      const freeSlots = max - entries.length;
      if (freeSlots <= 0) {
        setLimitReached(true);
        return;
      }
      if (list.length > freeSlots) setLimitReached(true);

      const accepted: PhotoEntry[] = [];
      const started: Array<{ localId: string; file: File; key: string }> = [];

      for (const file of list.slice(0, Math.max(freeSlots, 0))) {
        const localId = newIdempotencyKey();
        const idempotencyKey = newIdempotencyKey();
        const rejection = localRejection(file);
        const entry: PhotoEntry = {
          localId,
          fileName: file.name,
          phase: rejection === null ? "uploading" : "failed",
          progress: null,
          uploadId: null,
          thumbUrl: null,
          errorCode: rejection,
          idempotencyKey,
        };
        accepted.push(entry);
        filesRef.current.set(localId, file);
        if (rejection === null) started.push({ localId, file, key: idempotencyKey });
      }

      setEntries((prev) => [...prev, ...accepted]);
      for (const job of started) {
        void runUpload(job.localId, job.file, job.key);
      }
    },
    [entries.length, max, runUpload],
  );

  const remove = useCallback((localId: string) => {
    filesRef.current.delete(localId);
    setEntries((prev) => prev.filter((entry) => entry.localId !== localId));
    // Removing an entry always drops the list below `max`, so the limit can clear.
    setLimitReached(false);
  }, []);

  const retry = useCallback(
    (localId: string) => {
      const file = filesRef.current.get(localId);
      if (file === undefined) return;
      setEntries((prev) =>
        prev.map((entry) =>
          entry.localId === localId && entry.phase === "failed"
            ? { ...entry, phase: "uploading", progress: null, errorCode: null }
            : entry,
        ),
      );
      const entry = entries.find((candidate) => candidate.localId === localId);
      if (entry !== undefined && entry.phase === "failed") {
        void runUpload(localId, file, entry.idempotencyKey);
      }
    },
    [entries, runUpload],
  );

  const rehydrate = useCallback((imageIds: string[]) => {
    setEntries((prev) => {
      const known = new Set(prev.map((entry) => entry.uploadId));
      const restored = imageIds
        .filter((id) => !known.has(id))
        .map<PhotoEntry>((id) => ({
          localId: id,
          fileName: "",
          phase: "ready",
          progress: null,
          uploadId: id,
          thumbUrl: null,
          errorCode: null,
          idempotencyKey: id,
        }));
      return restored.length > 0 ? [...restored, ...prev] : prev;
    });
  }, []);

  const reset = useCallback(() => {
    filesRef.current.clear();
    setEntries([]);
    setLimitReached(false);
  }, []);

  const readyIds = entries
    .filter((entry) => entry.phase === "ready" && entry.uploadId !== null)
    .map((entry) => entry.uploadId as string);

  const inFlight = entries.some(
    (entry) => entry.phase === "uploading" || entry.phase === "processing",
  );

  return {
    entries,
    readyIds,
    inFlight,
    limitReached,
    addFiles,
    remove,
    retry,
    rehydrate,
    reset,
  };
}
