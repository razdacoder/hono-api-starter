CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(50) NOT NULL,
	"lastName" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"isActive" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"password" text NOT NULL,
	"updatedAt" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
