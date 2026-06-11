-- AlterTable
ALTER TABLE "Post" ADD COLUMN "replyToId" TEXT;

-- Index
CREATE INDEX "Post_replyToId_idx" ON "Post"("replyToId");

-- Foreign key
ALTER TABLE "Post" ADD CONSTRAINT "Post_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
