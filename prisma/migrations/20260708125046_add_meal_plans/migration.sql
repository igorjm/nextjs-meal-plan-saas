-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "dietType" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "allergies" TEXT,
    "cuisine" TEXT,
    "snacks" BOOLEAN NOT NULL DEFAULT false,
    "planData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlan_profileId_createdAt_idx" ON "MealPlan"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
