-- 0005_claims_chat: BE-05 claims, claim_answers, messages (+BE-05 indexes, partial uniques, checks) (TMU-DB-004).
-- rollback: DROP TABLE IF EXISTS messages, claim_answers, claims;
--           DROP TYPE IF EXISTS claim_status;
CREATE TYPE "public"."claim_status" AS ENUM('SUBMITTED', 'APPROVED', 'REJECTED', 'DISPUTED', 'COMPLETED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "claim_answers" (
	"claim_id" uuid NOT NULL,
	"hint_id" uuid NOT NULL,
	"answer" text NOT NULL,
	CONSTRAINT "claim_answers_claim_id_hint_id_pk" PRIMARY KEY("claim_id","hint_id")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" uuid PRIMARY KEY NOT NULL,
	"found_report_id" uuid NOT NULL,
	"lost_report_id" uuid,
	"claimant_id" uuid NOT NULL,
	"status" "claim_status" DEFAULT 'SUBMITTED' NOT NULL,
	"note" text,
	"handover_place" text,
	"handover_at" timestamp with time zone,
	"finder_confirmed_at" timestamp with time zone,
	"claimant_confirmed_at" timestamp with time zone,
	"decided_by" uuid,
	"decision_reason" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"claim_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	CONSTRAINT "messages_body_length_check" CHECK (char_length("messages"."body") <= 1000)
);
--> statement-breakpoint
ALTER TABLE "claim_answers" ADD CONSTRAINT "claim_answers_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_answers" ADD CONSTRAINT "claim_answers_hint_id_verification_hints_id_fk" FOREIGN KEY ("hint_id") REFERENCES "public"."verification_hints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_found_report_id_reports_id_fk" FOREIGN KEY ("found_report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_lost_report_id_reports_id_fk" FOREIGN KEY ("lost_report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_claimant_id_users_id_fk" FOREIGN KEY ("claimant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "claims_one_active_per_claimant" ON "claims" USING btree ("found_report_id","claimant_id") WHERE "claims"."status" IN ('SUBMITTED', 'APPROVED', 'DISPUTED');--> statement-breakpoint
CREATE UNIQUE INDEX "claims_one_approved_per_report" ON "claims" USING btree ("found_report_id") WHERE "claims"."status" = 'APPROVED';--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "messages_claim_created_idx" ON "messages" USING btree ("claim_id","created_at" DESC NULLS LAST);