"use client";

import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";

import type { ApiDropPoints, CustodyValue } from "@/features/report/types";

export interface CustodyStepProps {
  custody?: CustodyValue;
  dropPointId?: string;
  dropPoints: ApiDropPoints;
  loadingDropPoints?: boolean;
  onChangeCustody: (custody: CustodyValue) => void;
  onChangeDropPointId: (dropPointId: string | undefined) => void;
}

export function CustodyStep({
  custody,
  dropPointId,
  dropPoints,
  loadingDropPoints = false,
  onChangeCustody,
  onChangeDropPointId,
}: CustodyStepProps) {
  const t = useTranslations();

  const selectedDropPoint = dropPoints.find((dp) => dp.id === dropPointId);

  return (
    <div className="flex flex-col gap-6" data-testid="custody-step">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-text">
          {t("report.wizard.custody.label")} <span className="text-danger">*</span>
        </legend>

        {/* HELD_BY_FINDER */}
        <label
          data-testid="custody-option-finder"
          className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-md border p-3.5 transition-colors ${
            custody === "HELD_BY_FINDER"
              ? "border-primary bg-primary/5"
              : "border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="custody"
              value="HELD_BY_FINDER"
              checked={custody === "HELD_BY_FINDER"}
              onChange={() => {
                onChangeCustody("HELD_BY_FINDER");
                onChangeDropPointId(undefined);
              }}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-text">
              {t("report.wizard.custody.heldByFinder")}
            </span>
          </div>
          <span className="pl-6 text-xs text-text-muted">
            {t("report.wizard.custody.heldByFinderDesc")}
          </span>
        </label>

        {/* AT_DROP_POINT */}
        <label
          data-testid="custody-option-drop-point"
          className={`flex min-h-11 cursor-pointer flex-col gap-1 rounded-md border p-3.5 transition-colors ${
            custody === "AT_DROP_POINT"
              ? "border-primary bg-primary/5"
              : "border-border bg-surface hover:bg-surface-elevated"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="radio"
              name="custody"
              value="AT_DROP_POINT"
              checked={custody === "AT_DROP_POINT"}
              onChange={() => onChangeCustody("AT_DROP_POINT")}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-text">
              {t("report.wizard.custody.atDropPoint")}
            </span>
          </div>
          <span className="pl-6 text-xs text-text-muted">
            {t("report.wizard.custody.atDropPointDesc")}
          </span>
        </label>
      </fieldset>

      {/* Drop Point selection when AT_DROP_POINT */}
      {custody === "AT_DROP_POINT" && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-4">
          <label htmlFor="report-drop-point-select" className="text-sm font-medium text-text">
            {t("report.wizard.custody.dropPointSelect")} <span className="text-danger">*</span>
          </label>
          <select
            id="report-drop-point-select"
            data-testid="report-drop-point-select"
            value={dropPointId ?? ""}
            disabled={loadingDropPoints}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              onChangeDropPointId(e.target.value || undefined);
            }}
          >
            <option value="">{t("report.wizard.custody.dropPointPlaceholder")}</option>
            {dropPoints
              .filter((dp) => dp.active)
              .map((dp) => (
                <option key={dp.id} value={dp.id}>
                  {dp.name}
                </option>
              ))}
          </select>

          {selectedDropPoint && (
            <div className="mt-2 flex flex-col gap-1 rounded bg-surface-elevated p-2.5 text-xs text-text-muted">
              {selectedDropPoint.hours && <div>{selectedDropPoint.hours}</div>}
              {selectedDropPoint.contactNote && <div>{selectedDropPoint.contactNote}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
