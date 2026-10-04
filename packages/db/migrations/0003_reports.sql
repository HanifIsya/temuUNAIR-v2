-- 0003_reports: BE-05 reports, report_images, verification_hints (TMU-DB-002).
-- rollback: DROP TABLE IF EXISTS verification_hints, report_images, reports;
--           DROP TYPE IF EXISTS report_status, report_type;
CREATE TYPE "public"."report_status" AS ENUM('PENDING_REVIEW', 'OPEN', 'MATCHED', 'IN_VERIFICATION', 'RETURNED', 'EXPIRED', 'CANCELLED', 'REMOVED');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('LOST', 'FOUND');--> statement-breakpoint
CREATE TABLE "report_images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"report_id" uuid,
	"uploader_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"thumb_key" text,
	"masked_key" text,
	"mime" text NOT NULL,
	"width" integer,
	"height" integer,
	"sha256" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"position" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "report_images_status_check" CHECK ("report_images"."status" IN ('PENDING', 'READY', 'REJECTED'))
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" "report_type" NOT NULL,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"reporter_id" uuid NOT NULL,
	"category" text NOT NULL,
	"is_sensitive" boolean DEFAULT false NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"colors" text[] DEFAULT '{}' NOT NULL,
	"brand" text,
	"campus" "campus" NOT NULL,
	"location_id" uuid,
	"location_note" text,
	"lat" double precision,
	"lng" double precision,
	"occurred_from" timestamp with time zone NOT NULL,
	"occurred_to" timestamp with time zone,
	"custody" text,
	"drop_point_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"search_tsv" "tsvector",
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_custody_check" CHECK (("reports"."custody" IN ('HELD_BY_FINDER', 'AT_DROP_POINT'))),
	CONSTRAINT "reports_found_custody_check" CHECK (("reports"."type" = 'FOUND') = ("reports"."custody" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "verification_hints" (
	"id" uuid PRIMARY KEY NOT NULL,
	"report_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"answer_enc" "bytea" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_images" ADD CONSTRAINT "report_images_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_images" ADD CONSTRAINT "report_images_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_drop_point_id_drop_points_id_fk" FOREIGN KEY ("drop_point_id") REFERENCES "public"."drop_points"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_hints" ADD CONSTRAINT "verification_hints_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_browse_idx" ON "reports" USING btree ("type","status","campus","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "reports_tsv_idx" ON "reports" USING gin ("search_tsv");--> statement-breakpoint
CREATE INDEX "reports_expiry_idx" ON "reports" USING btree ("expires_at") WHERE "reports"."status" IN ('OPEN', 'MATCHED');