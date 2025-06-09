-- CreateTable
CREATE TABLE "generated_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_applications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generated_applications" ADD CONSTRAINT "generated_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
