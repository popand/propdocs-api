-- CreateEnum
CREATE TYPE "public"."PropertySharingLevel" AS ENUM ('PRIVATE', 'SHARED_LINK', 'PUBLIC_LISTING');

-- CreateEnum
CREATE TYPE "public"."PropertyRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('MAINTENANCE_DUE', 'MAINTENANCE_OVERDUE', 'WARRANTY_EXPIRING', 'SYSTEM_UPDATE', 'SHARING_INVITE', 'PAYMENT_REMINDER');

-- AlterTable
ALTER TABLE "public"."service_records" ADD COLUMN     "provider_id" TEXT;

-- CreateTable
CREATE TABLE "public"."property_shares" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "level" "public"."PropertySharingLevel" NOT NULL,
    "expires_at" TIMESTAMP(3),
    "allow_download" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "last_viewed" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "property_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."property_access" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "public"."PropertyRole" NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "granted_by" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "property_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_hierarchy" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "system_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_hierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "public"."MaintenanceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "priority" "public"."MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
    "estimated_cost" DOUBLE PRECISION,
    "estimated_time" INTEGER,
    "category" "public"."AssetCategory" NOT NULL,
    "asset_types" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "specialties" TEXT[],
    "rating" DOUBLE PRECISION,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_for" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_shares_share_token_key" ON "public"."property_shares"("share_token");

-- CreateIndex
CREATE INDEX "property_shares_share_token_idx" ON "public"."property_shares"("share_token");

-- CreateIndex
CREATE INDEX "property_shares_property_id_idx" ON "public"."property_shares"("property_id");

-- CreateIndex
CREATE INDEX "property_shares_expires_at_idx" ON "public"."property_shares"("expires_at");

-- CreateIndex
CREATE INDEX "property_access_property_id_idx" ON "public"."property_access"("property_id");

-- CreateIndex
CREATE INDEX "property_access_user_id_idx" ON "public"."property_access"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_access_property_id_user_id_key" ON "public"."property_access"("property_id", "user_id");

-- CreateIndex
CREATE INDEX "asset_hierarchy_parent_id_idx" ON "public"."asset_hierarchy"("parent_id");

-- CreateIndex
CREATE INDEX "asset_hierarchy_child_id_idx" ON "public"."asset_hierarchy"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_hierarchy_parent_id_child_id_key" ON "public"."asset_hierarchy"("parent_id", "child_id");

-- CreateIndex
CREATE INDEX "maintenance_templates_category_idx" ON "public"."maintenance_templates"("category");

-- CreateIndex
CREATE INDEX "maintenance_templates_is_active_idx" ON "public"."maintenance_templates"("is_active");

-- CreateIndex
CREATE INDEX "service_providers_name_idx" ON "public"."service_providers"("name");

-- CreateIndex
CREATE INDEX "service_providers_is_active_idx" ON "public"."service_providers"("is_active");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "public"."notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_sent_at_idx" ON "public"."notifications"("sent_at");

-- CreateIndex
CREATE INDEX "notifications_scheduled_for_idx" ON "public"."notifications"("scheduled_for");

-- CreateIndex
CREATE INDEX "asset_documents_asset_id_type_idx" ON "public"."asset_documents"("asset_id", "type");

-- CreateIndex
CREATE INDEX "asset_photos_asset_id_order_idx" ON "public"."asset_photos"("asset_id", "order");

-- CreateIndex
CREATE INDEX "assets_property_id_idx" ON "public"."assets"("property_id");

-- CreateIndex
CREATE INDEX "assets_category_idx" ON "public"."assets"("category");

-- CreateIndex
CREATE INDEX "assets_condition_idx" ON "public"."assets"("condition");

-- CreateIndex
CREATE INDEX "assets_warranty_expiry_idx" ON "public"."assets"("warranty_expiry");

-- CreateIndex
CREATE INDEX "assets_last_inspected_idx" ON "public"."assets"("last_inspected");

-- CreateIndex
CREATE INDEX "assets_created_at_idx" ON "public"."assets"("created_at");

-- CreateIndex
CREATE INDEX "assets_deleted_at_idx" ON "public"."assets"("deleted_at");

-- CreateIndex
CREATE INDEX "maintenance_schedules_asset_id_idx" ON "public"."maintenance_schedules"("asset_id");

-- CreateIndex
CREATE INDEX "maintenance_schedules_next_due_idx" ON "public"."maintenance_schedules"("next_due");

-- CreateIndex
CREATE INDEX "maintenance_schedules_is_active_idx" ON "public"."maintenance_schedules"("is_active");

-- CreateIndex
CREATE INDEX "maintenance_schedules_priority_idx" ON "public"."maintenance_schedules"("priority");

-- CreateIndex
CREATE INDEX "maintenance_tasks_schedule_id_idx" ON "public"."maintenance_tasks"("schedule_id");

-- CreateIndex
CREATE INDEX "maintenance_tasks_status_idx" ON "public"."maintenance_tasks"("status");

-- CreateIndex
CREATE INDEX "maintenance_tasks_due_date_idx" ON "public"."maintenance_tasks"("due_date");

-- CreateIndex
CREATE INDEX "maintenance_tasks_status_due_date_idx" ON "public"."maintenance_tasks"("status", "due_date");

-- CreateIndex
CREATE INDEX "properties_owner_id_idx" ON "public"."properties"("owner_id");

-- CreateIndex
CREATE INDEX "properties_type_idx" ON "public"."properties"("type");

-- CreateIndex
CREATE INDEX "properties_city_state_idx" ON "public"."properties"("city", "state");

-- CreateIndex
CREATE INDEX "properties_created_at_idx" ON "public"."properties"("created_at");

-- CreateIndex
CREATE INDEX "properties_deleted_at_idx" ON "public"."properties"("deleted_at");

-- CreateIndex
CREATE INDEX "property_photos_property_id_order_idx" ON "public"."property_photos"("property_id", "order");

-- CreateIndex
CREATE INDEX "service_records_asset_id_idx" ON "public"."service_records"("asset_id");

-- CreateIndex
CREATE INDEX "service_records_service_date_idx" ON "public"."service_records"("service_date");

-- CreateIndex
CREATE INDEX "service_records_provider_id_idx" ON "public"."service_records"("provider_id");

-- CreateIndex
CREATE INDEX "user_activity_logs_user_id_created_at_idx" ON "public"."user_activity_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_activity_logs_action_idx" ON "public"."user_activity_logs"("action");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "public"."user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "public"."user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "user_sessions_created_at_idx" ON "public"."user_sessions"("created_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_subscription_tier_idx" ON "public"."users"("subscription_tier");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "public"."users"("deleted_at");

-- AddForeignKey
ALTER TABLE "public"."service_records" ADD CONSTRAINT "service_records_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."service_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_shares" ADD CONSTRAINT "property_shares_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_shares" ADD CONSTRAINT "property_shares_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_access" ADD CONSTRAINT "property_access_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_access" ADD CONSTRAINT "property_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_access" ADD CONSTRAINT "property_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_hierarchy" ADD CONSTRAINT "asset_hierarchy_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_hierarchy" ADD CONSTRAINT "asset_hierarchy_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
