import type {
  CreateSkillDto,
  CreateUserSkillDto,
  GetSkillsDto,
  GetUserSkillsDto,
  Skill,
  UpdateSkillDto,
  UpdateUserSkillDto,
  UserSkill,
} from '@/lib/dto/skills.dto';

import type { SkillsDataSource } from './skills-datasource';

export class SkillsRepository {
  constructor(private readonly dataSource: SkillsDataSource) {}

  getSkills(dto: GetSkillsDto): Promise<Skill[]> {
    return this.dataSource.getSkills(dto);
  }

  getSkill(id: string): Promise<Skill | null> {
    return this.dataSource.getSkill(id);
  }

  createSkill(dto: CreateSkillDto): Promise<Skill> {
    return this.dataSource.createSkill(dto);
  }

  updateSkill(dto: UpdateSkillDto): Promise<Skill> {
    return this.dataSource.updateSkill(dto);
  }

  deleteSkill(id: string): Promise<void> {
    return this.dataSource.deleteSkill(id);
  }

  getUserSkills(dto: GetUserSkillsDto): Promise<UserSkill[]> {
    return this.dataSource.getUserSkills(dto);
  }

  createUserSkill(dto: CreateUserSkillDto): Promise<UserSkill> {
    return this.dataSource.createUserSkill(dto);
  }

  updateUserSkill(dto: UpdateUserSkillDto): Promise<UserSkill> {
    return this.dataSource.updateUserSkill(dto);
  }

  deleteUserSkill(id: string): Promise<void> {
    return this.dataSource.deleteUserSkill(id);
  }
}
