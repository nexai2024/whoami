-- AddForeignKey
ALTER TABLE "email_subscribers" ADD CONSTRAINT "email_subscribers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
