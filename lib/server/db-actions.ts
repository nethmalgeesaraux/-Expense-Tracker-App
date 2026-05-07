import { desc, eq } from "drizzle-orm";
import { db } from "./db/client";
import { expenseTransaction } from "./db/schemas";

export type ExpenseInput = {
    title: string;
    category: string;
    amount: number;
    expense_date: string;
};

export const getAllExpenses = async () => {
    const rows = await db
        .select()
        .from(expenseTransaction)
        .orderBy(desc(expenseTransaction.created_at));

    return rows;
};

export const getExpenseById = async (id: string) => {
    const rows = await db
        .select()
        .from(expenseTransaction)
        .where(eq(expenseTransaction.id, id))
        .limit(1);

    return rows[0] ?? null;
};

export const createExpenseItem = async (input: ExpenseInput) => {
    const { title, category, amount, expense_date } = input || {};

    const rows = await db
        .insert(expenseTransaction)
        .values({
            id: crypto.randomUUID(),
            title,
            category,
            amount,
            expense_date,
            created_at: Date.now(),
        })
        .returning();

    return rows[0];
};

export const updateExpenseItem = async (
    id: string,
    input: ExpenseInput,
) => {
    const { title, category, amount, expense_date } = input || {};

    const rows = await db
        .update(expenseTransaction)
        .set({ title, category, amount, expense_date })
        .where(eq(expenseTransaction.id, id))
        .returning();

    if (!rows.length) {
        return null;
    }

    return rows[0];
};
export const deleteExpenseItem = async (id: string) => {
    await db.delete(expenseTransaction).where(eq(expenseTransaction.id, id));
};
