import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Admin } from '../database/entity/Admin';
import { RefreshTokenAdmin } from '../database/entity/RefreshTokenAdmin';
import { AppError } from '../middleware/error/AppError';

export type CreateAdminDTO = {
    name: string;
    email: string;
    password: string;
};

export type UpdateAdminDTO = {
    name?: string;
    email?: string;
    password?: string;
};

export class AdminService {
    constructor(private dataSource: DataSource) {}

    private get repo() {
        return this.dataSource.getRepository(Admin);
    }

    async list() {
        return await this.repo.find({
            select: ['id', 'name', 'email'],
            order: { name: 'ASC' },
        });
    }

    async getById(adminId: number) {
        const admin = await this.repo.findOne({
            where: { id: adminId },
            select: ['id', 'name', 'email'],
        });
        if (!admin) throw new AppError('Admin não encontrado.', 404);
        return admin;
    }

    async create(data: CreateAdminDTO) {
        const existing = await this.repo.findOne({ where: { email: data.email } });
        if (existing) throw new AppError('Este e-mail já está em uso.', 400);

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const admin = this.repo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        });

        const saved = await this.repo.save(admin);
        return { id: saved.id, name: saved.name, email: saved.email };
    }

    async update(adminId: number, data: UpdateAdminDTO) {
        const admin = await this.repo.findOne({ where: { id: adminId } });
        if (!admin) throw new AppError('Admin não encontrado.', 404);

        if (data.email && data.email !== admin.email) {
            const emailInUse = await this.repo.findOne({ where: { email: data.email } });
            if (emailInUse) throw new AppError('Este e-mail já está em uso.', 400);
        }

        if (data.name) admin.name = data.name;
        if (data.email) admin.email = data.email;
        if (data.password) admin.password = await bcrypt.hash(data.password, 12);

        await this.repo.save(admin);
        return { id: admin.id, name: admin.name, email: admin.email };
    }

    async getMasterId(): Promise<number> {
        const [master] = await this.repo.find({ order: { id: 'ASC' }, take: 1 });
        return master?.id ?? 1;
    }

    async delete(requesterId: number, adminId: number) {
        const masterId = await this.getMasterId();

        if (adminId === masterId) {
            throw new AppError('O admin master não pode ser removido.', 403);
        }
        if (requesterId !== masterId) {
            throw new AppError('Apenas o admin master pode remover outros admins.', 403);
        }

        const admin = await this.repo.findOne({ where: { id: adminId } });
        if (!admin) throw new AppError('Admin não encontrado.', 404);

        await this.dataSource.getRepository(RefreshTokenAdmin).delete({ admin: { id: adminId } });
        await this.repo.remove(admin);
    }
}
