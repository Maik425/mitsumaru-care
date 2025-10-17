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

export interface SkillsDataSource {
  getSkills(dto: GetSkillsDto): Promise<Skill[]>;
  getSkill(id: string): Promise<Skill | null>;
  createSkill(dto: CreateSkillDto): Promise<Skill>;
  updateSkill(dto: UpdateSkillDto): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;
  getUserSkills(dto: GetUserSkillsDto): Promise<UserSkill[]>;
  createUserSkill(dto: CreateUserSkillDto): Promise<UserSkill>;
  updateUserSkill(dto: UpdateUserSkillDto): Promise<UserSkill>;
  deleteUserSkill(id: string): Promise<void>;
}
