import type {
  CreatePositionDto,
  CreateUserPositionDto,
  GetPositionsDto,
  GetUserPositionsDto,
  Position,
  UpdatePositionDto,
  UserPosition,
} from '@/lib/dto/positions.dto';

import type { PositionsDataSource } from './positions-datasource';

export class PositionsRepository {
  constructor(private readonly dataSource: PositionsDataSource) {}

  getPositions(dto: GetPositionsDto): Promise<Position[]> {
    return this.dataSource.getPositions(dto);
  }

  getPosition(id: string): Promise<Position | null> {
    return this.dataSource.getPosition(id);
  }

  createPosition(dto: CreatePositionDto): Promise<Position> {
    return this.dataSource.createPosition(dto);
  }

  updatePosition(dto: UpdatePositionDto): Promise<Position> {
    return this.dataSource.updatePosition(dto);
  }

  deletePosition(id: string): Promise<void> {
    return this.dataSource.deletePosition(id);
  }

  getUserPositions(dto: GetUserPositionsDto): Promise<UserPosition[]> {
    return this.dataSource.getUserPositions(dto);
  }

  createUserPosition(dto: CreateUserPositionDto): Promise<UserPosition> {
    return this.dataSource.createUserPosition(dto);
  }

  deleteUserPosition(id: string): Promise<void> {
    return this.dataSource.deleteUserPosition(id);
  }
}
