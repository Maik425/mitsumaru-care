export interface Project {
  id: string;
  name: string;
  tenantId: string;
  ownerId: string;
}

export interface CreateProjectInput {
  name: string;
}
