import { Project } from '../entities/Project';

export interface ProjectRepository {
  findAllByTenant(tenantId: string): Promise<Project[]>;
  create(p: Project): Promise<void>;
}
