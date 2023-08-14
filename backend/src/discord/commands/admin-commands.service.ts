import { Injectable, UseFilters, UseGuards } from "@nestjs/common";
import { Context, Options, SlashCommandContext, Subcommand, createCommandGroupDecorator } from "necord";
import { AdminGuard } from "../guards/admin.guard";
import { ForbiddenExceptionFilter } from "../filters/forbidden-exception.filter";
import { AdminEmojiDto } from "./dtos/admin-emoji.dto";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { AdminSwitchRoleCommandDto } from "./dtos/admin-switch-role.dto";
import { DiscordService } from "../discord.service";
import { RoleGroupService } from "src/database/entities/role-group/role-group.service";
import { RoleService } from "src/database/entities/role/role.service";
import { DatabaseService } from "src/database/database.service";
import { ApexSyncService } from "../apex-connect/apex-sync.service";
import { handleAdminCreateMessageDto } from "./dtos/admin-create-message.dto";
import { AdminCreateLeaderboardDto } from "./dtos/admin-create-leaderboard.dto";
import { ApexLeaderboardService } from "../apex-statistics/apex-leaderboard.service";
import { ApexRankingReportService } from "../apex-statistics/apex-ranking-report.service";
import { AdminCreateRankingReportDto } from "./dtos/admin-create-ranking-report.dto";
import { handleAdminInsideAddUserDto } from "./dtos/handle-inside-add-user.dto";
import { InsideService } from "../inside/inside.service";
import { manageMembersService } from "../inside/manage-members.service";

export const AdminCommandsDecorator = createCommandGroupDecorator({
    name: 'admin',
    description: 'Komendy administratorskie',
    guilds: [process.env.MAIN_GUILD_ID]
})

@Injectable()
@AdminCommandsDecorator()
export class AdminCommandsService {

    constructor(
        private readonly emojiService: EmojiService,
        private readonly discordService: DiscordService,
        private readonly roleService: RoleService,
        private readonly databaseService: DatabaseService,
        private readonly apexSyncService: ApexSyncService,
        private readonly apexLeaderboardService: ApexLeaderboardService,
        private readonly apexRankingReportService: ApexRankingReportService,
        private readonly manageMembersService: manageMembersService,
    ) {}

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'emoji',
        description: 'Ustaw emoji w bazie danych',
    })
    public async onAdminEmoji(@Context() [Interaction]: SlashCommandContext, @Options() options: AdminEmojiDto) {
        console.log(`[CommandsService] onAdminEmoji: ${options.emoji} - ${options.emojiName}`);

        const emoteRegex = /<:.+?:\d+>/g;
        const animatedEmoteRegex = /<a:.+:(\d+)>/gm;

        let emojis = [];

        if (emoteRegex.test(options.emoji)) {
            emojis = options.emoji.match(emoteRegex);
        } else if (animatedEmoteRegex.test(options.emoji)) {
            Interaction.reply({ content: 'Animowane emoji nie są jeszcze wspierane!', ephemeral: true});
            return false;
        } else {
            Interaction.reply({ content: 'Niepoprawne emoji!', ephemeral: true});
            return false;
        }

        const dbEmoji = await this.emojiService.findByName(options.emojiName);

        const regex = /:(\d+)>/;
        const discordId = emojis[0].match(regex)[1];

        console.log(`Preparing emoji data: ${emojis[0]}`);

        const emojiData = {
            discordId: discordId,
            discordName: emojis[0].split(":")[1],
            name: options.emojiName,
        };

        console.log('Prepared emoji data: ', emojiData);

        if (!dbEmoji) {
            // Create emoji
            const newEmoji = await this.emojiService.create(emojiData);

            if (!newEmoji) {
                Interaction.reply({ content: 'Nie udało się dodać emoji', ephemeral: true});
                return;
            }

            Interaction.reply({ content: `Dodano emoji!`, ephemeral: true});
        } else {
            // Update emoji
            const updatedEmoji = await this.emojiService.update(dbEmoji.id, emojiData);

            if (!updatedEmoji) {
                Interaction.reply({ content: 'Nie udało się zaktualizować emoji', ephemeral: true});
            }

            Interaction.reply({ content: `Emoji zaktualizowane!`, ephemeral: true});
        }
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'zmień-rolę',
        description: 'Zmień rolę z danej grupy ról',
    })
    public async onAdminSwitchRole(@Context() [Interaction]: SlashCommandContext, @Options() options: AdminSwitchRoleCommandDto) {
        // console.log(`[CommandsService] onAdminEmoji: ${options.emoji} - ${options.emojiName}`);
        console.log(`[CommandsService] onAdminSwitchRole: ${options.user} - ${options.role}`);

        const member = await this.discordService.getMemberById(options.user.id);
        const role = options.role;

        if (!member) {
            Interaction.reply({ content: 'Nie znaleziono użytkownika', ephemeral: true});
            return false;
        }

        if (!role) {
            Interaction.reply({ content: 'Nie znaleziono roli', ephemeral: true});
            return false;
        }

        const dbRole = await this.roleService.findByDiscordId(role.id);

        if (!dbRole || !dbRole?.roleGroup) {
            Interaction.reply({ content: 'Rola nie należy do żadnej grupy', ephemeral: true});
            return false;
        }
        
        console.log('Starting to switch role: ', member.id, dbRole.roleGroup.name, role.id);

        this.discordService.switchRoleFromGroup(member.id, dbRole.roleGroup.name, role.id);

        Interaction.reply({ content: `Rola <@&${role.id}> z grupy **${dbRole.roleGroup.name}** została zmieniona dla użytkownika <@${member.id}>`, ephemeral: true});
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'stwórz-wiadomość',
        description: 'Stwórz jedną z wiadomości zarządzanych przez bota',
    })
    public async onAdminCreateMessage(@Context() [Interaction]: SlashCommandContext, @Options() options: handleAdminCreateMessageDto) {
        switch (options.messageType) {
            case 'synchronization':
                await this.apexSyncService.handleAdminCreateSynchronizationMessage(Interaction);
                break;
        }
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'zaktualizuj-połączone-role',
        description: 'Zaktualizuj role dla połączonych użytkowników',
    })
    public async onAdminUpdateConnectedRoles(@Context() [Interaction]: SlashCommandContext) {
        console.log(`[CommandsService] onAdminUpdateConnectedRoles`);

        await this.apexSyncService.handleAdminUpdateConnectedRole(Interaction);
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'zaktualizuj-połączone-konta',
        description: 'Zaktualizuj konta połączonych użytkowników obecnych na serwerze',
    })
    public async onAdminUpdateConnectedAccounts(@Context() [Interaction]: SlashCommandContext) {
        console.log(`[CommandsService] onAdminUpdateConnectedAccounts`);

        await this.apexSyncService.handleAdminUpdateConnectedAccounts(Interaction);
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'backup-bazy-danych',
        description: 'Wykonaj wewnętrzny backup bazy danych',
    })
    public async onAdminDatabaseBackup(@Context() [Interaction]: SlashCommandContext) {
        console.log(`[CommandsService] onAdminDatabaseBackup`);

        const response = await Interaction.reply({ content: `Rozpoczynanie tworzenia backupu bazy danych!`, ephemeral: true});

        if (!await this.databaseService.backupDatabase()) {
            response.edit({ content: `Nie udało się wykonać backupu bazy danych ❌\nSprawdź logi aplikacji.`});
            return false;
        }

        response.edit({ content: `Backup bazy danych został wykonany ✅`});
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'stwórz-tablicę-wyników',
        description: 'Stwórz tablicę TOP 20 graczy Apex Legends na serwerze',
    })
    public async onAdminCreateApexLeaderboard(@Context() [Interaction]: SlashCommandContext, @Options() options: AdminCreateLeaderboardDto) {
        console.log(`[CommandsService] onAdminCreateApexLeaderboard`);

        await this.apexLeaderboardService.handleAdminCreateLeaderboard(Interaction, options);
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'zaktualizuj-tablicę-wyników',
        description: 'Zaktualizuj tablicę TOP 20 graczy Apex Legends na serwerze',
    })
    public async onAdminUpdateLeaderbord(@Context() [Interaction]: SlashCommandContext) {
        console.log(`[CommandsService] onAdminUpdateLeaderbord`);

        await this.apexLeaderboardService.handleAdminUpdateLeaderboard(Interaction);
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'stwórz-raport-rankingowy',
        description: 'Stwórz raport rankingowy dla graczy Apex Legends na serwerze',
    })
    public async onAdminCreateRankingReport(@Context() [Interaction]: SlashCommandContext, @Options() options: AdminCreateRankingReportDto) {
        console.log(`[CommandsService] onAdminUpdateLeaderbord`);

        await this.apexRankingReportService.handleAdminCreateRankingReport(Interaction, options);
    }

    @UseGuards(AdminGuard)
    @UseFilters(ForbiddenExceptionFilter)
    @Subcommand({
        name: 'inside-dodaj-członka',
        description: 'Dodaj użytkownika do PLA Inside i przywitaj go odpowiednio',
    })
    public async onAdminInsideAddUser(@Context() [Interaction]: SlashCommandContext, @Options() options: handleAdminInsideAddUserDto) {
        console.log(`[CommandsService] onAdminUpdateLeaderbord`);

        this.manageMembersService.handleAdminAddMember(Interaction, options);
    }

}