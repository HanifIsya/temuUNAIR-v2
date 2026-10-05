"use client";

import { useTranslations } from "next-intl";

export interface HintItem {
  prompt: string;
  answer: string;
}

export interface HintsStepProps {
  hints: HintItem[];
  suggestedPrompts?: string[];
  isSensitive?: boolean;
  onChangeHints: (hints: HintItem[]) => void;
}

export function HintsStep({
  hints,
  suggestedPrompts = [],
  isSensitive = false,
  onChangeHints,
}: HintsStepProps) {
  const t = useTranslations();
  const minHints = isSensitive ? 2 : 1;
  const maxHints = 3;

  const updateHint = (index: number, field: "prompt" | "answer", val: string) => {
    const next = [...hints];
    const item = next[index] ?? { prompt: "", answer: "" };
    next[index] = { ...item, [field]: val };
    onChangeHints(next);
  };

  const addHint = (initialPrompt = "") => {
    if (hints.length >= maxHints) return;
    onChangeHints([...hints, { prompt: initialPrompt, answer: "" }]);
  };

  const removeHint = (index: number) => {
    if (hints.length <= minHints && hints.length <= 1) return;
    onChangeHints(hints.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6" data-testid="hints-step">
      {/* Warning banner */}
      <div
        role="note"
        className="flex flex-col gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-200"
      >
        <span className="font-semibold">{t("report.wizard.hints.warning")}</span>
        <span>{t("report.wizard.hints.desc")}</span>
        {isSensitive && (
          <span className="mt-1 font-medium text-danger">
            {t("report.wizard.hints.sensitiveWarning")}
          </span>
        )}
      </div>

      {/* Suggested prompts if available */}
      {suggestedPrompts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">
            {t("report.wizard.hints.suggestions")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                data-testid={`hint-suggestion-${suggestion.slice(0, 10)}`}
                onClick={() => {
                  const lastEmptyIdx = hints.findIndex((h) => !h.prompt);
                  if (lastEmptyIdx !== -1) {
                    updateHint(lastEmptyIdx, "prompt", suggestion);
                  } else if (hints.length < maxHints) {
                    addHint(suggestion);
                  }
                }}
                className="min-h-11 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-surface-elevated"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hints editor list */}
      <div className="flex flex-col gap-4">
        {hints.map((hint, idx) => (
          <div
            key={idx}
            data-testid={`hint-item-${idx}`}
            className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">
                {t("report.wizard.hints.promptLabel", { index: idx + 1 })}
              </span>
              {hints.length > minHints && (
                <button
                  type="button"
                  data-testid={`hints-remove-${idx}`}
                  onClick={() => removeHint(idx)}
                  className="min-h-11 px-2 text-xs text-danger hover:underline"
                >
                  {t("report.wizard.hints.removeHint")}
                </button>
              )}
            </div>

            {/* Prompt input */}
            <div className="flex flex-col gap-1">
              <label htmlFor={`hints-prompt-${idx}`} className="sr-only">
                {t("report.wizard.hints.promptLabel", { index: idx + 1 })}
              </label>
              <input
                id={`hints-prompt-${idx}`}
                data-testid={`hints-prompt-${idx}`}
                type="text"
                value={hint.prompt}
                maxLength={200}
                placeholder={t("report.wizard.hints.promptPlaceholder")}
                className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                onChange={(e) => updateHint(idx, "prompt", e.target.value)}
              />
            </div>

            {/* Answer input (password safe) */}
            <div className="flex flex-col gap-1">
              <label htmlFor={`hints-answer-${idx}`} className="text-xs font-medium text-text">
                {t("report.wizard.hints.answerLabel")} <span className="text-danger">*</span>
              </label>
              <input
                id={`hints-answer-${idx}`}
                data-testid={`hints-answer-${idx}`}
                type="password"
                autoComplete="off"
                value={hint.answer}
                maxLength={200}
                placeholder={t("report.wizard.hints.answerPlaceholder")}
                className="min-h-11 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                onChange={(e) => updateHint(idx, "answer", e.target.value)}
              />
              <span className="text-[11px] text-text-muted">
                {t("report.wizard.hints.answerNotice")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add hint button */}
      {hints.length < maxHints && (
        <button
          type="button"
          data-testid="hints-add"
          onClick={() => addHint()}
          className="min-h-11 w-full rounded-md border border-dashed border-border py-2.5 text-xs font-medium text-text hover:bg-surface-elevated"
        >
          + {t("report.wizard.hints.addHint")}
        </button>
      )}
    </div>
  );
}
