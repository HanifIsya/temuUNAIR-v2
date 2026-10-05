-- 0004_reports_additions_matching: BE-05 reports additions (needs_reprocess, FTS trigger) + matching tables (image_features, report_features, matches) (TMU-DB-003).
-- rollback: DROP TABLE IF EXISTS matches, report_features, image_features;
--           DROP TRIGGER IF EXISTS reports_tsv_trg ON reports;
--           DROP FUNCTION IF EXISTS reports_tsv_update();
--           ALTER TABLE reports DROP COLUMN IF EXISTS needs_reprocess;
--           DROP TYPE IF EXISTS match_state;
CREATE FUNCTION reports_tsv_update() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv := to_tsvector('simple',
    coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,'') || ' ' ||
    coalesce(NEW.brand,'') || ' ' || array_to_string(NEW.colors, ' '));
  RETURN NEW;
END $$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER reports_tsv_trg BEFORE INSERT OR UPDATE OF title, description, brand, colors
  ON reports FOR EACH ROW EXECUTE FUNCTION reports_tsv_update();--> statement-breakpoint
CREATE TYPE "public"."match_state" AS ENUM('SUGGESTED', 'DISMISSED', 'CLAIMED', 'INVALIDATED');--> statement-breakpoint
CREATE TABLE "image_features" (
	"image_id" uuid PRIMARY KEY NOT NULL,
	"embedding" vector(512) NOT NULL,
	"detection" jsonb,
	"quality" jsonb,
	"category_scores" jsonb,
	"model_versions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lost_report_id" uuid NOT NULL,
	"found_report_id" uuid NOT NULL,
	"score" numeric(4, 3) NOT NULL,
	"band" text NOT NULL,
	"reasons" jsonb NOT NULL,
	"components" jsonb NOT NULL,
	"state" "match_state" DEFAULT 'SUGGESTED' NOT NULL,
	"algo_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_lost_report_id_found_report_id_unique" UNIQUE("lost_report_id","found_report_id")
);
--> statement-breakpoint
CREATE TABLE "report_features" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"image_embedding" vector(512),
	"clip_text_embedding" vector(512),
	"sentence_embedding" vector(384),
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"model_versions" jsonb NOT NULL,
	"processed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "needs_reprocess" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "image_features" ADD CONSTRAINT "image_features_image_id_report_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."report_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_lost_report_id_reports_id_fk" FOREIGN KEY ("lost_report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_found_report_id_reports_id_fk" FOREIGN KEY ("found_report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_features" ADD CONSTRAINT "report_features_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_features_img_hnsw" ON "report_features" USING hnsw ("image_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "report_features_txt_hnsw" ON "report_features" USING hnsw ("clip_text_embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "report_features_sent_hnsw" ON "report_features" USING hnsw ("sentence_embedding" vector_cosine_ops);