CREATE TABLE "itinerary_plan_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_plan_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "itinerary_plan_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "itinerary_plan_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "itinerary_plan_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "itinerary_plan_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itinerary_plan_account" ADD CONSTRAINT "itinerary_plan_account_user_id_itinerary_plan_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."itinerary_plan_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_plan_session" ADD CONSTRAINT "itinerary_plan_session_user_id_itinerary_plan_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."itinerary_plan_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "itinerary_plan_account_userId_idx" ON "itinerary_plan_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "itinerary_plan_session_userId_idx" ON "itinerary_plan_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "itinerary_plan_verification_identifier_idx" ON "itinerary_plan_verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "itinerary_plan_trips" ADD CONSTRAINT "itinerary_plan_trips_owner_id_itinerary_plan_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."itinerary_plan_user"("id") ON DELETE cascade ON UPDATE no action;