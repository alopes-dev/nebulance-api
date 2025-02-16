import { AuthModel } from "@models/AuthModel";
import { generateToken } from "@routes/helpers";
import { FastifyTypedInstance, IAuth, IUser } from "@utils/types";
import bcrypt from "bcryptjs";

export class AuthService {
  private readonly model: typeof AuthModel;

  constructor(model: typeof AuthModel) {
    this.model = model;
  }

  async login(payload: IAuth, app: FastifyTypedInstance) {
    const user = await this.model.login(payload);

    if (!user || !(await bcrypt.compare(payload.password, user.password))) {
      throw new Error("Invalid email or password");
    }

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(responseUser, app);

    return { user: responseUser, token };
  }

  async register(payload: IUser) {
    const { email, password, name } = payload;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.model.register({
      email,
      password: hashedPassword,
      name,
    });

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return responseUser;
  }
}
