import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityEventService } from './community-event.service';
import { CreateCommunityEventDto } from './dto/create-community-event.dto';
import { UpdateCommunityEventDto } from './dto/update-community-event.dto';

@Controller('community-event')
export class CommunityEventController {
  constructor(private readonly communityEventService: CommunityEventService) {}

  @Post()
  create(@Body() createCommunityEventDto: CreateCommunityEventDto) {
    return this.communityEventService.create(createCommunityEventDto);
  }

  @Get()
  findAll() {
    return this.communityEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityEventService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityEventDto: UpdateCommunityEventDto) {
    return this.communityEventService.update(+id, updateCommunityEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityEventService.remove(+id);
  }
}
