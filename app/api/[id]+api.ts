import type { RequestHandler } from "expo-router/server";
import {
  deleteExpenseItem,
  getExpenseById,
  updateExpenseItem,
  type ExpenseInput,
} from "../../lib/server/db-actions";

const jsonError = (status: number, message: string, details?: string[]) =>
  Response.json(
    { success: false, message, details },
    { status },
  );

const parseExpenseInput = async (
  request: Request,
): Promise<{ data?: ExpenseInput; details?: string[] }> => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { details: ["Request body must be valid JSON."] };
  }

  if (!body || typeof body !== "object") {
    return { details: ["Request body must be a JSON object."] };
  }

  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  const expense_date =
    typeof raw.expense_date === "string" ? raw.expense_date.trim() : "";
  const amount =
    typeof raw.amount === "number" ? raw.amount : Number(raw.amount);

  const details: string[] = [];

  if (!title) details.push("title is required.");
  if (!category) details.push("category is required.");
  if (!expense_date) details.push("expense_date is required.");
  if (!Number.isFinite(amount)) details.push("amount must be a valid number.");
  if (Number.isFinite(amount) && !Number.isInteger(amount)) {
    details.push("amount must be an integer.");
  }
  if (Number.isFinite(amount) && amount <= 0) {
    details.push("amount must be greater than 0.");
  }

  if (details.length > 0) {
    return { details };
  }

  return {
    data: {
      title,
      category,
      amount,
      expense_date,
    },
  };
};

const readExpenseId = (params: Record<string, string>): string | null => {
  const id = params.id?.trim();
  return id || null;
};

export const GET: RequestHandler = async (_request, params) => {
  const id = readExpenseId(params);

  if (!id) {
    return jsonError(400, "Expense id is required.");
  }

  try {
    const expense = await getExpenseById(id);

    if (!expense) {
      return jsonError(404, "Expense not found.");
    }

    return Response.json({ success: true, data: expense }, { status: 200 });
  } catch {
    return jsonError(500, "Failed to fetch expense.");
  }
};

const updateHandler: RequestHandler = async (request, params) => {
  const id = readExpenseId(params);

  if (!id) {
    return jsonError(400, "Expense id is required.");
  }

  const parsed = await parseExpenseInput(request);

  if (!parsed.data) {
    return jsonError(400, "Validation failed.", parsed.details);
  }

  try {
    const updated = await updateExpenseItem(id, parsed.data);

    if (!updated) {
      return jsonError(404, "Expense not found.");
    }

    return Response.json(
      { success: true, message: "Expense updated.", data: updated },
      { status: 200 },
    );
  } catch {
    return jsonError(500, "Failed to update expense.");
  }
};

export const PUT = updateHandler;
export const PATCH = updateHandler;

export const DELETE: RequestHandler = async (_request, params) => {
  const id = readExpenseId(params);

  if (!id) {
    return jsonError(400, "Expense id is required.");
  }

  try {
    const existing = await getExpenseById(id);

    if (!existing) {
      return jsonError(404, "Expense not found.");
    }

    await deleteExpenseItem(id);
    return Response.json(
      { success: true, message: "Expense deleted." },
      { status: 200 },
    );
  } catch {
    return jsonError(500, "Failed to delete expense.");
  }
};
