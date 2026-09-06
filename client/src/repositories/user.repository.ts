import { Types } from 'mongoose'

import { connectDB } from '@/lib/db'
import { UserModel, type IUserDocument } from '@/models/user'
import { TENANT_USER_POPULATE } from '@/repositories/tenant.repository'

export class UserRepository {
  async findByGoogleId(googleId: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findOne({ googleId }).populate('tenantId', TENANT_USER_POPULATE).exec()
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findOne({ email: email.toLowerCase() }).populate('tenantId', TENANT_USER_POPULATE).exec()
  }

  async findById(id: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findById(id).populate('tenantId', TENANT_USER_POPULATE).exec()
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
      .populate('tenantId', TENANT_USER_POPULATE)
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
      .populate('tenantId', TENANT_USER_POPULATE)
      .exec()
  }

  async findOwnerByTenantId(tenantId: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findOne({ tenantId, role: 'owner', isActive: true }).exec()
  }

  async findByTenantId(tenantId: string): Promise<IUserDocument[]> {
    await connectDB()

    return UserModel.find({ tenantId }).exec()
  }

  async clearTenant(id: string): Promise<IUserDocument | null> {
    await connectDB()

    return UserModel.findByIdAndUpdate(
      id,
      { $unset: { tenantId: '' }, $set: { role: 'member' } },
      { new: true }
    )
      .populate('tenantId', TENANT_USER_POPULATE)
      .exec()
  }

  async deleteManyByTenantId(tenantId: string): Promise<number> {
    await connectDB()

    const objectId = Types.ObjectId.isValid(tenantId) ? new Types.ObjectId(tenantId) : null

    const result = await UserModel.deleteMany({
      $or: [{ tenantId }, ...(objectId ? [{ tenantId: objectId }] : [])]
    }).exec()

    return result.deletedCount ?? 0
  }
}

export const userRepository = new UserRepository()
