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

import type { JobRulesDataSource } from './job-rules-datasource';

export class JobRulesRepository {
  constructor(private readonly dataSource: JobRulesDataSource) {}

  // Job Types
  getJobTypes(dto: GetJobTypesDto): Promise<JobType[]> {
    return this.dataSource.getJobTypes(dto);
  }

  getJobType(id: string): Promise<JobType | null> {
    return this.dataSource.getJobType(id);
  }

  createJobType(dto: CreateJobTypeDto): Promise<JobType> {
    return this.dataSource.createJobType(dto);
  }

  updateJobType(dto: UpdateJobTypeDto): Promise<JobType> {
    return this.dataSource.updateJobType(dto);
  }

  deleteJobType(id: string): Promise<void> {
    return this.dataSource.deleteJobType(id);
  }

  // Areas
  getAreas(dto: GetAreasDto): Promise<Area[]> {
    return this.dataSource.getAreas(dto);
  }

  getArea(id: string): Promise<Area | null> {
    return this.dataSource.getArea(id);
  }

  createArea(dto: CreateAreaDto): Promise<Area> {
    return this.dataSource.createArea(dto);
  }

  updateArea(dto: UpdateAreaDto): Promise<Area> {
    return this.dataSource.updateArea(dto);
  }

  deleteArea(id: string): Promise<void> {
    return this.dataSource.deleteArea(id);
  }

  // Job Rule Templates
  getJobRuleTemplates(dto: GetJobRuleTemplatesDto): Promise<JobRuleTemplate[]> {
    return this.dataSource.getJobRuleTemplates(dto);
  }

  getJobRuleTemplate(id: string): Promise<JobRuleTemplate | null> {
    return this.dataSource.getJobRuleTemplate(id);
  }

  createJobRuleTemplate(
    dto: CreateJobRuleTemplateDto
  ): Promise<JobRuleTemplate> {
    return this.dataSource.createJobRuleTemplate(dto);
  }

  updateJobRuleTemplate(
    dto: UpdateJobRuleTemplateDto
  ): Promise<JobRuleTemplate> {
    return this.dataSource.updateJobRuleTemplate(dto);
  }

  deleteJobRuleTemplate(id: string): Promise<void> {
    return this.dataSource.deleteJobRuleTemplate(id);
  }

  // Job Rule Sets
  getJobRuleSets(dto: GetJobRuleSetsDto): Promise<JobRuleSet[]> {
    return this.dataSource.getJobRuleSets(dto);
  }

  getJobRuleSet(id: string): Promise<JobRuleSet | null> {
    return this.dataSource.getJobRuleSet(id);
  }

  createJobRuleSet(dto: CreateJobRuleSetDto): Promise<JobRuleSet> {
    return this.dataSource.createJobRuleSet(dto);
  }

  updateJobRuleSet(dto: UpdateJobRuleSetDto): Promise<JobRuleSet> {
    return this.dataSource.updateJobRuleSet(dto);
  }

  deleteJobRuleSet(id: string): Promise<void> {
    return this.dataSource.deleteJobRuleSet(id);
  }
}
