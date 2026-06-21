import { connectDB } from '@/lib/db'
import { UserModel, type IUserDocument } from '@/models/user'

export class UserRepository {
  async findByGoogleId(googleId: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findOne({ googleId }).populate('tenantId', 'name slug status plan').exec()
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findOne({ email: email.toLowerCase() }).populate('tenantId', 'name slug status plan').exec()
  }

  async findById(id: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findById(id).populate('tenantId', 'name slug status plan').exec()
  }

  async createFromGoogle(data: Pick<IUserDocument, 'googleId' | 'email' | 'name' | 'image'>): Promise<IUserDocument> {
    await connectDB()

    return UserModel.create(data)
  }

  async linkGoogleAccount(
    id: string,
    data: Pick<IUserDocument, 'googleId' | 'name' | 'image'>
  ): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findByIdAndUpdate(
      id,
      {
        googleId: data.googleId,
        name: data.name,
        image: data.image,
        lastLoginAt: new Date()
      },
      { new: true }
    )
      .populate('tenantId', 'name slug status plan')
      .exec()
  }

  async updateLastLogin(id: string): Promise<void> {
    await connectDB()

    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec()
  }

  async assignTenant(id: string, tenantId: IUserDocument['tenantId']): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findByIdAndUpdate(
      id,
      {
        tenantId,
        role: 'owner',
        lastLoginAt: new Date()
      },
      { new: true }
    )
      .populate('tenantId', 'name slug status plan')
      .exec()
  }
}

export const userRepository = new UserRepository()
