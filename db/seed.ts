import "dotenv/config";
import { db } from ".";          
import { seed } from "drizzle-seed";
import * as schema from "./schema";  

async function main() {
  console.log("Starting database seeding...");

  await seed(db, { users: schema.users }).refine((f) => ({
    users: {
      count: 100,            
      columns: {
        name: f.fullName(),
        email: f.email(),
      },
    },
  }));

  console.log("Seeding completed");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });