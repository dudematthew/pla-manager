import { Injectable } from "@nestjs/common";
import { CacheType, ChannelType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { AdminCreateLeaderboardDto } from "../commands/dtos/admin-create-leaderboard.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ApexLeaderboardService {

    constructor(
        private readonly configService: ConfigService,
    ) {}

    public async handleAdminCreateLeaderboard(interaction: ChatInputCommandInteraction<CacheType>, options: AdminCreateLeaderboardDto) {

        if (!options.channel)
            options.channel = interaction.channel;

        console.log(`[ApexLeaderboardService] handleAdminCreateLeaderboard: ${options.channel}`);

        interaction.reply({ content: 'Tworzenie tablicy...', ephemeral: true });

        if (options.channel.type !== ChannelType.GuildText) {
            interaction.editReply({ content: '### :x: Tablica może być tworzona tylko na kanale tekstowym!'});
            return false;
        }

        const embed = await this.getBasicLeaderboardEmbed();

        const message = await options.channel.send({ embeds: [embed] });
    }

    private async getBasicLeaderboardEmbed (): Promise<EmbedBuilder> {
        const embed = new EmbedBuilder();

        embed.setAuthor({
            name: 'TOP 20 graczy na serwerze PLA',
            iconURL: this.configService.get<string>('images.logo'),
        })

        return embed;
    }
}