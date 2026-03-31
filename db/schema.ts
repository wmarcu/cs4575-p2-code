import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  real,
  json,
  timestamp,
} from "drizzle-orm/pg-core";

// Difficulty enum
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Problems
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("easy"),
  examples: json("examples").notNull().default([]),
  constraints: json("constraints").notNull().default([]),
  functionName: varchar("function_name", { length: 255 }).notNull().default("solution"),
  testCases: json("test_cases").notNull().default([]),
  starterCode: text("starter_code").notNull().default(""),
  complexity: json("complexity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Submissions (leaderboard source) 
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  problemId: integer("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  energyConsumption: real("energy_consumption").notNull(), 
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
