/*
  Warnings:

  - Added the required column `ownerEmail` to the `App` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "App" ADD COLUMN     "ownerEmail" TEXT NOT NULL;
