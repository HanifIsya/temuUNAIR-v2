---
id: RISKS
title: Risk register
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["PRD", "NFR"]
source_refs: ["Blueprint §1.3", "DEC-014", "DEC-015", "DEC-016", "DEC-017"]
---

# Risk register

Likelihood (L) and Impact (I): 1 low → 5 high. **Score = L × I**. Owner is a role, not a person
(roles: SW spec-writer, AR architect, ML ml-dev, SR security-reviewer, OR orchestrator, human).

| ID | Risk | L | I | Score | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| RISK-001 | **False-positive matches erode trust** — users chase wrong suggestions | 4 | 4 | 16 | Bands + explainable reasons, no raw scores, "AI is advisory" (DEC-012), eval-driven thresholds, dismissal feedback loop, tune via `/eval-matching` | ML | open |
| RISK-002 | **PII leak of sensitive items** (KTM/ATM photos, hint answers) | 3 | 5 | 15 | Masking + generalized text (DEC-014), AES-GCM hint answers, login-only browsing (DEC-018), EXIF strip (DEC-010), security review per milestone, RLS-style service checks | SR | open |
| RISK-003 | **Fraud / false claims** — someone claims an item they do not own | 4 | 4 | 16 | Hidden-detail challenge (DEC-004), claim quotas (3/day), 3-rejection block, moderator arbitration, audit log, two-sided handover confirmation | AR | open |
| RISK-004 | **Cold start** — no matches at launch because the corpus is empty | 5 | 3 | 15 | Seed demo data, invite-first launch per campus, FTS + browse fallback, daily digest of POSSIBLE, "rematch" button | OR | open |
| RISK-005 | **YOLO class gap** — COCO lacks KTM, wallet, keys, tumbler, AirPods (DEC-015) | 5 | 2 | 10 | YOLO is crop helper only; fall back to full-image embedding; CLIP zero-shot category scores; fine-tuning is stretch | ML | open |
| RISK-006 | **AGPL-3.0 licence** of Ultralytics YOLO blocks commercial/public deployment (DEC-016) | 2 | 4 | 8 | Acceptable for coursework; flag in README + ADR-0009; re-evaluate Apache-2.0 detector before public launch | SR | open |
| RISK-007 | **CPU latency** makes matching slow at peak (DEC-011) | 3 | 3 | 9 | Small models (ViT-B/32, YOLO-n), batching, worker concurrency cap, async jobs so UI never blocks, warm-up on boot | ML | open |
| RISK-008 | **SSO availability / domain mismatch** — UNAIR Google Workspace unavailable or domains differ from assumptions (DEC-001) | 3 | 4 | 12 | Domain allowlist via env (no code change), dev magic-link fallback, confirm with UNAIR DTI before M3, graceful auth error page | AR | open |
| RISK-009 | **Moderator workload** — queue grows faster than humans clear it | 3 | 3 | 9 | Flag threshold (≥2 distinct), campus-scoped moderators, auto-hide pending items, stats dashboard, SLA in ops guide | SW | open |
| RISK-010 | **Abuse / spam / scraping** | 4 | 3 | 12 | Login-only browsing (DEC-018), rate limits (§5A.13), claim quotas, captcha-lite on auth, IP limits, audit log | SR | open |
| RISK-011 | **Embedding model drift / re-index cost** — new model invalidates stored vectors | 3 | 2 | 6 | `algo_version` on every row, `matching.reindex` job, model lockfile with checksums, ADR-0004 gate | ML | open |
| RISK-012 | **Legal/privacy non-compliance** (UU PDP) before launch (DEC-017) | 3 | 5 | 15 | Privacy notice + terms drafts, data inventory, retention automation, deletion flow, **human legal review gate** in roadmap | SR | open |
| RISK-013 | **Scope creep** — blueprint covers 9 milestones; course deadline is fixed | 4 | 3 | 12 | MoSCoW discipline, non-goals list, milestone exit criteria, stretch tasks explicitly deferred | OR | open |
| RISK-014 | **Agent loop damage** — an agent pushes to main, edits out of lane, or commits a secret | 2 | 5 | 10 | Branch protection, `check-lane.sh`, permission deny for push (except git-steward), gitleaks hooks, `.agent/STOP`, iteration caps | OR | open |
| RISK-015 | **Proposal PDF/logo missing from repo** — docs stay unapproved, brand tokens are placeholders | 1 | 2 | 2 | PDF committed in TMU-DOC-002; logo.png placeholder tracked; TMU-DSG-001 scheduled to sample real logo palette | OR | mitigated |

## Active actions for high-severity risks (Score ≥ 15)

Standing rule 3 requires every risk with score ≥ 15 to carry an explicit owner action:

| ID | Score | Risk | Owner | Action & Milestone |
|---|---|---|---|---|
| RISK-001 | 16 | False-positive matches | ML | M1 eval harness plan (`07-ml-evaluation-plan.md`); M5 baseline eval run against synthetic corpus (`TMU-ML-012`). |
| RISK-002 | 15 | PII leak of sensitive items | SR | M1 privacy policy and retention spec (`15-privacy-and-data-retention.md`); M4 photo masking and EXIF stripping; M8 security review (`TMU-SEC-001..008`). |
| RISK-003 | 16 | Fraud / false claims | AR | M1 user flows and Gherkin edge cases (`07-acceptance-criteria.md`); M6 two-sided confirmation and quota limits (`TMU-BE-027..038`). |
| RISK-004 | 15 | Cold start | OR | M3 seed data with synthetic UNAIR lost/found records; M4 browse/FTS search fallbacks; M5 batch notification digests. |
| RISK-012 | 15 | Legal/privacy non-compliance | SR | M1 draft privacy notice & terms (`13-legal-privacy-drafts.md`); M8 compliance review; M9 formal legal sign-off gate before public launch. |

## Review cadence

- Reviewed at every milestone gate (M1, M3, M5, M7, M9) by the orchestrator + security-reviewer.
- Score ≥ 15 items must have an owner action in the current milestone (see table above).
- New risk discovered by an agent → add a row here (spec-writer lane) or a blocker file if it stops work.
