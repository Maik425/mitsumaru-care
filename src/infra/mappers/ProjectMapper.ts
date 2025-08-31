import { Project } from '@/src/domain/entities/Project';
import type { Project as Row } from '@prisma/client';

export const toDomain = (row: Row) =>
  new Project(row.id, row.name, row.tenantId, row.ownerId);

export const toRow = (p: Project) => ({
  id: p.id,
  name: p.name,
  tenantId: p.tenantId,
  ownerId: p.ownerId,
});
