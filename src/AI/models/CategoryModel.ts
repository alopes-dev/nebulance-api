import * as tf from "@tensorflow/tfjs-node";

export class CategoryModel {
  public createModel(outputSize: number): tf.Sequential {
    const HIDDEN_LAYER_1_UNITS = 8;
    const HIDDEN_LAYER_2_UNITS = 4;
    const INPUT_FEATURES = 2;

    const model = tf.sequential();

    // Input layer with first hidden layer
    model.add(
      tf.layers.dense({
        units: HIDDEN_LAYER_1_UNITS,
        activation: "relu",
        inputShape: [INPUT_FEATURES],
      })
    );

    // Second hidden layer
    model.add(
      tf.layers.dense({
        units: HIDDEN_LAYER_2_UNITS,
        activation: "relu",
      })
    );

    // Output layer
    model.add(
      tf.layers.dense({
        units: outputSize,
        activation: "softmax", // Softmax for multi-class classification
      })
    );

    // Configure model training parameters
    model.compile({
      optimizer: "adam",
      loss: "sparseCategoricalCrossentropy",
      metrics: ["accuracy"],
    });

    return model;
  }
}
