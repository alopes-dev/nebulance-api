import { TransactionModel } from "@models/TransactionModel";
import { ITrainingData, ITransaction } from "@utils/types";
import { CategoryModel } from "@AI/models/CategoryModel";
import * as tf from "@tensorflow/tfjs-node";
import { Category } from "@prisma/client";

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
}
