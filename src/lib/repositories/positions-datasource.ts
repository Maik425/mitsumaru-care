import type {
  CreatePositionDto,
  CreateUserPositionDto,
  GetPositionsDto,
  GetUserPositionsDto,
  Position,
  UpdatePositionDto,
  UserPosition,
} from '@/lib/dto/positions.dto';

export interface PositionsDataSource {
  getPositions(dto: GetPositionsDto): Promise<Position[]>;
  getPosition(id: string): Promise<Position | null>;
  createPosition(dto: CreatePositionDto): Promise<Position>;
  updatePosition(dto: UpdatePositionDto): Promise<Position>;
  deletePosition(id: string): Promise<void>;
  getUserPositions(dto: GetUserPositionsDto): Promise<UserPosition[]>;
  createUserPosition(dto: CreateUserPositionDto): Promise<UserPosition>;
  deleteUserPosition(id: string): Promise<void>;
}
