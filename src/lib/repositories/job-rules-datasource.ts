import type {
  Area,
  CreateAreaDto,
  CreateJobRuleSetDto,
  CreateJobRuleTemplateDto,
  CreateJobTypeDto,
  GetAreasDto,
  GetJobRuleSetsDto,
  GetJobRuleTemplatesDto,
  GetJobTypesDto,
  JobRuleSet,
  JobRuleTemplate,
  JobType,
  UpdateAreaDto,
  UpdateJobRuleSetDto,
  UpdateJobRuleTemplateDto,
  UpdateJobTypeDto,
} from '@/lib/dto/job-rules.dto';

export interface JobRulesDataSource {
  // Job Types
  getJobTypes(dto: GetJobTypesDto): Promise<JobType[]>;
  getJobType(id: string): Promise<JobType | null>;
  createJobType(dto: CreateJobTypeDto): Promise<JobType>;
  updateJobType(dto: UpdateJobTypeDto): Promise<JobType>;
  deleteJobType(id: string): Promise<void>;

  // Areas
  getAreas(dto: GetAreasDto): Promise<Area[]>;
  getArea(id: string): Promise<Area | null>;
  createArea(dto: CreateAreaDto): Promise<Area>;
  updateArea(dto: UpdateAreaDto): Promise<Area>;
  deleteArea(id: string): Promise<void>;

  // Job Rule Templates
  getJobRuleTemplates(dto: GetJobRuleTemplatesDto): Promise<JobRuleTemplate[]>;
  getJobRuleTemplate(id: string): Promise<JobRuleTemplate | null>;
  createJobRuleTemplate(
    dto: CreateJobRuleTemplateDto
  ): Promise<JobRuleTemplate>;
  updateJobRuleTemplate(
    dto: UpdateJobRuleTemplateDto
  ): Promise<JobRuleTemplate>;
  deleteJobRuleTemplate(id: string): Promise<void>;

  // Job Rule Sets
  getJobRuleSets(dto: GetJobRuleSetsDto): Promise<JobRuleSet[]>;
  getJobRuleSet(id: string): Promise<JobRuleSet | null>;
  createJobRuleSet(dto: CreateJobRuleSetDto): Promise<JobRuleSet>;
  updateJobRuleSet(dto: UpdateJobRuleSetDto): Promise<JobRuleSet>;
  deleteJobRuleSet(id: string): Promise<void>;
}
