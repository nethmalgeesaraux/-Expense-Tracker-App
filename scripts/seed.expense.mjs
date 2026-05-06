import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const readDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return undefined;
  }

  const envFile = readFileSync(envPath, "utf8");
  const line = envFile
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith("DATABASE_URL="));

  if (!line) {
    return undefined;
  }

  const value = line.slice("DATABASE_URL=".length).trim();
  return value.replace(/^['"]|['"]$/g, "");
};

const databaseUrl = readDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(databaseUrl);

const expenseItems = [
  {
    title: "Lunch at cafe",
    category: "Food",
    amount: 250,
    expense_date: "04-13-2026",
  },
  {
    title: "Uber ride",
    category: "Transport",
    amount: 180,
    expense_date: "04-12-2026",
  },
  {
    title: "Grocery shopping",
    category: "Groceries",
    amount: 1200,
    expense_date: "04-10-2026",
  },
  {
    title: "Netflix subscription",
    category: "Entertainment",
    amount: 550,
    expense_date: "04-09-2026",
  },
  {
    title: "Electricity bill",
    category: "Bills",
    amount: 3200,
    expense_date: "04-08-2026",
  },
  {
    title: "Coffee with friend",
    category: "Food",
    amount: 450,
    expense_date: "04-07-2026",
  },
  {
    title: "Fuel refill",
    category: "Transport",
    amount: 4500,
    expense_date: "04-06-2026",
  },
  {
    title: "Mobile data package",
    category: "Bills",
    amount: 999,
    expense_date: "04-05-2026",
  },
  {
    title: "Medicine purchase",
    category: "Health",
    amount: 1750,
    expense_date: "04-03-2026",
  },
  {
    title: "Online course fee",
    category: "Education",
    amount: 3000,
    expense_date: "04-02-2026",
  },
  {
    title: "Office snacks",
    category: "Food",
    amount: 680,
    expense_date: "04-01-2026",
  },
  {
    title: "Shoes shopping",
    category: "Shopping",
    amount: 6200,
    expense_date: "03-30-2026",
  },
];

const clearBeforeInsert = process.env.CLEAR_EXPENSES === "true";

const seedExpenses = async () => {
  if (clearBeforeInsert) {
    await sql`delete from expense_transaction`;
    console.log("Cleared existing expense_transaction data.");
  }

  const baseTime = Date.now();

  for (let index = 0; index < expenseItems.length; index += 1) {
    const item = expenseItems[index];

    await sql`
      insert into expense_transaction (id, title, category, amount, expense_date, created_at)
      values (
        ${randomUUID()},
        ${item.title},
        ${item.category},
        ${item.amount},
        ${item.expense_date},
        ${baseTime + index}
      )
    `;
  }

  console.log(`Seeded ${expenseItems.length} expense rows successfully.`);
};

seedExpenses()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed expenses:", error);
    process.exit(1);
  });
