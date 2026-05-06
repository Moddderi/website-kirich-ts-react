import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Добавляем второй аргумент, чтобы указать, ЧТО именно мы валидируем
export const validate =
  (schema: ZodSchema, target: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        target: target, // Показываем, где именно ошибка
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Обновляем данные (важно для приведения типов, например из string в number)
    req[target] = result.data;
    next();
  };
