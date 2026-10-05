"use client";

import { useTranslations } from "next-intl";
import type { ChangeEvent } from "react";

import type { ApiCampuses, ApiLocations, CampusValue } from "@/features/report/types";

export interface LocationStepProps {
  type: "LOST" | "FOUND";
  campus?: CampusValue;
  locationId?: string;
  note?: string;
  occurredFrom?: string;
  occurredTo?: string;
  campuses: ApiCampuses;
  locations: ApiLocations;
  loadingCampuses?: boolean;
  loadingLocations?: boolean;
  onChangeCampus: (campus: CampusValue) => void;
  onChangeLocationId: (locationId: string | undefined) => void;
  onChangeNote: (note: string) => void;
  onChangeOccurredFrom: (from: string) => void;
  onChangeOccurredTo: (to: string | undefined) => void;
}

// Convert ISO string to datetime-local input string (YYYY-MM-DDTHH:mm)
function toLocalInputString(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    // Offset for local or Asia/Jakarta
    const pad = (n: number) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  } catch {
    return "";
  }
}

// Convert datetime-local input string to ISO string with offset
function fromLocalInputString(local: string): string {
  if (!local) return "";
  try {
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
  } catch {
    return "";
  }
}

export function LocationStep({
  type: _type,
  campus,
  locationId,
  note = "",
  occurredFrom = "",
  occurredTo = "",
  campuses,
  locations,
  loadingCampuses = false,
  loadingLocations = false,
  onChangeCampus,
  onChangeLocationId,
  onChangeNote,
  onChangeOccurredFrom,
  onChangeOccurredTo,
}: LocationStepProps) {
  const t = useTranslations();

  const handleQuickChip = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(8, 0, 0, 0);
    onChangeOccurredFrom(d.toISOString());
  };

  return (
    <div className="flex flex-col gap-6" data-testid="location-step">
      {/* Campus */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-campus-select" className="text-sm font-medium text-text">
          {t("report.wizard.where.campusLabel")} <span className="text-danger">*</span>
        </label>
        <select
          id="report-campus-select"
          data-testid="report-campus-select"
          value={campus ?? ""}
          disabled={loadingCampuses}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            const val = e.target.value as CampusValue;
            onChangeCampus(val);
            onChangeLocationId(undefined);
          }}
        >
          <option value="">{t("report.wizard.where.campusPlaceholder")}</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Specific Location (optional) */}
      {campus && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-location-select" className="text-sm font-medium text-text">
            {t("report.wizard.where.locationLabel")}
          </label>
          <select
            id="report-location-select"
            data-testid="report-location-select"
            value={locationId ?? ""}
            disabled={loadingLocations}
            className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              onChangeLocationId(e.target.value || undefined);
            }}
          >
            <option value="">{t("report.wizard.where.locationPlaceholder")}</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.building ? `(${loc.building})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-location-note" className="text-sm font-medium text-text">
          {t("report.wizard.where.noteLabel")}
        </label>
        <input
          id="report-location-note"
          data-testid="report-location-note"
          type="text"
          value={note}
          maxLength={200}
          placeholder={t("report.wizard.where.notePlaceholder")}
          className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeNote(e.target.value)}
        />
      </div>

      {/* DateTime Range */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-text">
          {t("report.wizard.where.timeRange")} <span className="text-danger">*</span>
        </span>

        {/* Quick chips */}
        <div className="flex gap-2">
          <button
            type="button"
            data-testid="quick-chip-today"
            onClick={() => handleQuickChip(0)}
            className="min-h-11 rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-text hover:bg-surface-elevated"
          >
            {t("report.wizard.where.today")}
          </button>
          <button
            type="button"
            data-testid="quick-chip-yesterday"
            onClick={() => handleQuickChip(1)}
            className="min-h-11 rounded-md border border-border bg-surface px-4 py-2 text-xs font-medium text-text hover:bg-surface-elevated"
          >
            {t("report.wizard.where.yesterday")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="report-occurred-from" className="text-xs text-text-muted">
              {t("report.wizard.where.fromLabel")}
            </label>
            <input
              id="report-occurred-from"
              data-testid="report-occurred-from"
              type="datetime-local"
              value={toLocalInputString(occurredFrom)}
              className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                onChangeOccurredFrom(fromLocalInputString(e.target.value));
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="report-occurred-to" className="text-xs text-text-muted">
              {t("report.wizard.where.toLabel")}
            </label>
            <input
              id="report-occurred-to"
              data-testid="report-occurred-to"
              type="datetime-local"
              value={toLocalInputString(occurredTo)}
              className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const val = fromLocalInputString(e.target.value);
                onChangeOccurredTo(val || undefined);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
