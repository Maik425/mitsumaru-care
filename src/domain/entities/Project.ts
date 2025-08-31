export class Project {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly tenantId: string,
    public readonly ownerId: string
  ) {
    if (!name?.trim()) throw new Error('Project name required');
  }

  rename(newName: string) {
    if (!newName?.trim()) throw new Error('Invalid name');
    this.name = newName;
  }
}
