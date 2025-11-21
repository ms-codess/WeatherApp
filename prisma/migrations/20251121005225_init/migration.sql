-- CreateTable
CREATE TABLE "Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tripName" TEXT NOT NULL,
    "locationInput" TEXT NOT NULL,
    "normalizedCity" TEXT,
    "normalizedCountry" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TripWeather" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tripId" INTEGER NOT NULL,
    "weatherJson" TEXT NOT NULL,
    "avgTemp" REAL,
    "minTemp" REAL,
    "maxTemp" REAL,
    "summaryText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripWeather_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "locationInput" TEXT NOT NULL,
    "normalizedCity" TEXT,
    "normalizedCountry" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TripWeather_tripId_key" ON "TripWeather"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_latitude_longitude_key" ON "Favorite"("latitude", "longitude");
