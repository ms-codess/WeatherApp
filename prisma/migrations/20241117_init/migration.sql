-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "tripName" TEXT NOT NULL,
    "inputLocation" TEXT NOT NULL,
    "normalizedCity" TEXT,
    "normalizedCountry" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripWeather" (
    "id" SERIAL NOT NULL,
    "tripId" INTEGER NOT NULL,
    "weatherJson" JSONB NOT NULL,
    "avgTemp" DOUBLE PRECISION,
    "minTemp" DOUBLE PRECISION,
    "maxTemp" DOUBLE PRECISION,
    "summaryText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripWeather_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripWeather_tripId_key" ON "TripWeather"("tripId");

-- AddForeignKey
ALTER TABLE "TripWeather" ADD CONSTRAINT "TripWeather_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
