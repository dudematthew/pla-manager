import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private http: HttpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([
      () => this.http.pingCheck('discord-api', 'https://discord.com/api/v8/gateway'),
      () => this.http.pingCheck('apex-api', `https://api.mozambiquehe.re/?auth=${process.env.APEX_API_KEY}`),
    ]);
  }
  
}
