import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TourneyService } from './tourney.service';
import { CreateTourneyDto } from './dto/create-tourney.dto';
import { UpdateTourneyDto } from './dto/update-tourney.dto';

@Controller('/api/tourney')
export class TourneyController {
  constructor(
    private readonly tourneyService: TourneyService,
  ) {}

  @Post()
  create(@Body() createTourneyDto: CreateTourneyDto) {
    return this.tourneyService.create(createTourneyDto);
  }

  @Get()
  findAll() {
    return this.tourneyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourneyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTourneyDto: UpdateTourneyDto) {
    return this.tourneyService.update(+id, updateTourneyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tourneyService.remove(+id);
  }
}
