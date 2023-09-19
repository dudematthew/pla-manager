import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

export class UpdateApexAccountDto {
  @IsString()
  name?: string;

  @IsString()
  uid?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsString()
  platform?: string;

  @IsOptional()
  @IsNumber()
  rankScore?: number;

  @IsOptional()
  @IsString()
  rankName?: string;

  @IsOptional()
  @IsString()
  rankDivision?: string;

  @IsOptional()
  @IsString()
  rankImg?: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsNumber()
  percentToNextLevel?: number;

  @IsOptional()
  @IsNumber()
  brTotalKills?: number;

  @IsOptional()
  @IsNumber()
  brTotalWins?: number;

  @IsOptional()
  @IsNumber()
  brTotalGamesPlayed?: number;

  @IsOptional()
  @IsNumber()
  brKDR?: number;

  @IsOptional()
  @IsNumber()
  brTotalDamage?: number;

  @IsOptional()
  @IsString()
  lastLegendPlayed?: string;
}

