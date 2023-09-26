import { Injectable } from '@nestjs/common';
import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { handleGivewayJoinCommandDto } from '../commands/dtos/handle-giveaway-join-command.dto.ts';

@Injectable()
export class GiveawayService {
    constructor() {}

    public async handleGiveawayJoinDiscordCommand(interaction: ChatInputCommandInteraction<CacheType>, options: handleGivewayJoinCommandDto) {
        console.log('handleGiveawayJoinDiscordCommand');

        interaction.deferReply();


    }
}
