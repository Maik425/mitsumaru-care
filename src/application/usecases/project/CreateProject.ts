import { v4 as uuid } from 'uuid';
import * as yup from 'yup';
import { ProjectRepository } from '@/src/domain/repositories/ProjectRepository';
import { Project } from '@/src/domain/entities/Project';

export const CreateProjectSchema = yup.object({
  name: yup.string().trim().min(1).required(),
});

export type CreateProjectInput = yup.InferType<typeof CreateProjectSchema>;
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

export class CreateProject {
  constructor(private readonly repo: ProjectRepository) {}

  async execute(
    input: CreateProjectInput,
    ctx: { userId: string; tenantId: string; role: Role }
  ) {
    if (!ctx.userId || !ctx.tenantId) throw new Error('UNAUTHORIZED');
    if (ctx.role === 'MEMBER') throw new Error('FORBIDDEN');

    const p = new Project(uuid(), input.name, ctx.tenantId, ctx.userId);
    await this.repo.create(p);
    return { id: p.id };
  }
}
