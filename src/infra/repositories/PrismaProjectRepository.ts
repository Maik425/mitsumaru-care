import { prisma } from '@/src/infra/prisma/client';
import { ProjectRepository } from '@/src/domain/repositories/ProjectRepository';
import { Project } from '@/src/domain/entities/Project';
import { toDomain, toRow } from '@/src/infra/mappers/ProjectMapper';

export class PrismaProjectRepository implements ProjectRepository {
  async findAllByTenant(tenantId: string) {
    const rows = await prisma.project.findMany({ where: { tenantId } });
    return rows.map(toDomain);
  }

  async create(p: Project) {
    await prisma.project.create({ data: toRow(p) as any });
  }
}
