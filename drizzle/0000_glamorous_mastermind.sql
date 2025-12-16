CREATE TABLE "emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"content" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
