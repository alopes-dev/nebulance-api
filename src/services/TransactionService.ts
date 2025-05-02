import { TransactionModel } from "@models/TransactionModel";
import { ITrainingData, ITransaction } from "@utils/types";
import { CategoryModel } from "@AI/models/CategoryModel";
import * as tf from "@tensorflow/tfjs-node";
import { Category, TransactionType } from "@prisma/client";
import * as pdfParse from "pdf-parse";
import { AccountModel } from "@models/AccountModel";
import { amountPatterns, parseCurrencyAmount } from "@utils/helpers";

export class TransactionService {
  private readonly model: typeof TransactionModel;

  constructor(model: typeof TransactionModel) {
    this.model = model;
  }

  async getAllService(userId: string) {
    return this.model.getAllModel(userId);
  }

  async createService(payload: ITransaction) {
    const category =
      payload.category ??
      ((await this.categorizeExpense({
        amount: payload.amount,
        description: payload.description,
        userId: payload.userId,
      })) as Category);

    return this.model.createModel({
      ...payload,
      category,
    });
  }

  async analysisService(userId: string) {
    return this.model.analysis(userId);
  }

  async categorizeExpense(
    payload: Pick<ITransaction, "amount" | "description" | "userId">
  ): Promise<string> {
    const FALLBACK_CATEGORY = Category.OTHERS;
    const TRAINING_EPOCHS = 50;

    const trainingData = await this.prepareTrainModel(payload.userId);
    if (!trainingData) return FALLBACK_CATEGORY;

    const { data, categories } = trainingData;
    const categoryModel = new CategoryModel();
    const model = categoryModel.createModel(categories.length);

    // Prepare input and output tensors for training
    const inputTensor = tf.tensor2d(data.map(({ input }) => input));
    const outputTensor = tf.tensor1d(
      data.map(({ output }) => output),
      "float32"
    );

    // Train the model with the prepared data
    await model.fit(inputTensor, outputTensor, { epochs: TRAINING_EPOCHS });

    // Predict category for the new expense
    const expenseFeatures = [[payload.amount, payload.description.length]];
    const predictionInput = tf.tensor2d(expenseFeatures);
    const prediction = model.predict(predictionInput) as tf.Tensor;
    const predictedCategoryIndex = prediction.argMax(-1).dataSync()[0];

    // Clean up tensors to prevent memory leaks
    inputTensor.dispose();
    outputTensor.dispose();
    predictionInput.dispose();
    prediction.dispose();

    return categories[predictedCategoryIndex] ?? FALLBACK_CATEGORY;
  }

  private async prepareTrainModel(
    userId: string
  ): Promise<ITrainingData | null> {
    // Fetch transactions once and store in variable
    const transactions = await this.model.getByUserIdModel(userId);

    // Early return if not enough data
    const MINIMUM_TRANSACTIONS = 10;
    if (transactions.length < MINIMUM_TRANSACTIONS) {
      return null;
    }

    // Extract unique categories using Set
    const categories = [
      ...new Set(transactions.map(({ category }) => category)),
    ];

    // Create category mapping
    const categoryIndex = new Map(
      categories.map((category, index) => [category, index])
    );

    // Transform transactions into training data
    const data = transactions.map(({ amount, description, category }) => ({
      input: [amount, description.length],
      output: categoryIndex.get(category)!,
    })) as ITrainingData["data"];

    return { data, categories: categories as string[] };
  }

  async processPDFService(
    buffer: Buffer,
    userId: string
  ): Promise<ITransaction[]> {
    try {
      const account = await AccountModel.getByUserId(userId);

      if (!account) {
        throw new Error("Account not found");
      }

      const data = await pdfParse.default(buffer);
      const text = data.text;

      // Extract transactions from PDF text
      const transactions = this.extractTransactionsFromPDF(
        text,
        userId,
        account.id
      );

      // Process each transaction
      const processedTransactions: ITransaction[] = [];
      for (const transaction of transactions) {
        const processed = await this.createService(transaction);
        processedTransactions.push({
          ...processed,
          date: new Date(processed.date).toISOString(),
          createdAt: new Date(processed.createdAt).toISOString(),
          updatedAt: new Date(processed.updatedAt).toISOString(),
        });
      }

      return processedTransactions;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error("Failed to process PDF");
    }
  }

  private extractTransactionsFromPDF(
    text: string,
    userId: string,
    accountId: string
  ): ITransaction[] {
    const transactions: ITransaction[] = [];
    const lines = text.split("\n");

    // Common patterns in bank statements
    const datePattern = /(\d{2}\/\d{2}\/\d{4})/;
    //06 Nov, 2024
    const datePattern2 = /(\d{2} \w{3}, \d{4})/;
    //11/01/2024- 11/30/2024 or 11/01/2024-11/30/2024
    const statementPeriodPattern =
      /(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/;

    let currentDate: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip if it's a statement period line
      if (line.match(statementPeriodPattern)) {
        continue;
      }

      // Check for valid transaction dates
      const dateMatch = line.match(datePattern);
      const dateMatch2 = line.match(datePattern2);

      if (dateMatch || dateMatch2) {
        const dateStr = dateMatch ? dateMatch[1] : dateMatch2![1];

        const date = new Date(dateStr);
        const formattedDate = date.toISOString();
        currentDate = formattedDate;
      }

      // Try matching each currency pattern
      let amountMatch = null;

      // Try each currency pattern, defaulting to EUR if no match found
      let matched = false;
      for (const [currency, pattern] of Object.entries(amountPatterns)) {
        const match = line.match(pattern);
        if (match) {
          amountMatch = match;
          matched = true;
          break;
        }
      }

      // If no pattern matched, try EUR pattern as default
      if (!matched) {
        const match = line.match(amountPatterns.usd);
        if (match) {
          amountMatch = match;
        }
      }

      if (amountMatch && currentDate) {
        const [_, amountStr] = amountMatch;
        // Normalize the amount string based on the matched pattern

        const numericAmount = parseCurrencyAmount(amountStr);

        // Get description (usually the text before the amount)
        const description = line.substring(0, line.indexOf(amountStr)).trim();

        // Determine transaction type based on amount
        const type =
          numericAmount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

        // Try to categorize based on description
        const category = this.categorizeTransaction(description);
        console.log(description, category);
        transactions.push({
          amount: Math.abs(numericAmount),
          type,
          category,
          description: description || "Unknown transaction",
          date: currentDate,
          accountId,
          userId,
        });
      }
    }

    return transactions;
  }

  private categorizeTransaction(description: string): Category {
    // Simple categorization based on keywords
    const lowerDesc = description.toLowerCase();

    if (
      lowerDesc.includes("food") ||
      lowerDesc.includes("restaurant") ||
      lowerDesc.includes("grocery")
    ) {
      return Category.FOOD;
    } else if (
      lowerDesc.includes("transport") ||
      lowerDesc.includes("uber") ||
      lowerDesc.includes("taxi")
    ) {
      return Category.TRANSPORT;
    } else if (lowerDesc.includes("rent") || lowerDesc.includes("mortgage")) {
      return Category.HOUSING;
    } else if (
      lowerDesc.includes("electric") ||
      lowerDesc.includes("water") ||
      lowerDesc.includes("gas")
    ) {
      return Category.UTILITIES;
    } else if (
      lowerDesc.includes("entertainment") ||
      lowerDesc.includes("movie") ||
      lowerDesc.includes("netflix")
    ) {
      return Category.ENTERTAINMENT;
    } else if (
      lowerDesc.includes("health") ||
      lowerDesc.includes("medical") ||
      lowerDesc.includes("pharmacy")
    ) {
      return Category.HEALTHCARE;
    } else if (
      lowerDesc.includes("shop") ||
      lowerDesc.includes("store") ||
      lowerDesc.includes("mall")
    ) {
      return Category.SHOPPING;
    } else {
      return Category.OTHERS;
    }
  }
}
