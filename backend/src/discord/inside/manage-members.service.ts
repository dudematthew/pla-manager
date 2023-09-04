import { Injectable } from "@nestjs/common";
import { handleAdminInsideAddUserDto, plaTeamToNameDictionary } from "../commands/dtos/handle-inside-add-user.dto";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, CacheType, ChatInputCommandInteraction } from "discord.js";
import { RoleService } from "src/database/entities/role/role.service";
import { DiscordService } from "../discord.service";
import { EmojiService } from "src/database/entities/emoji/emoji.service";
import { RoleEntity } from "src/database/entities/role/entities/role.entity";
import { ConfigService } from "@nestjs/config";
import { teamsCompositionService } from "./teams-composition.service";

@Injectable()
export class manageMembersService {

    constructor (
        private readonly roleService: RoleService,
        private readonly discordService: DiscordService,
        private readonly emojiService: EmojiService,
        private readonly configService: ConfigService,
        private readonly teamsCompositionService: teamsCompositionService,
    ) {}

    public async handleAdminAddMember (interaction: ChatInputCommandInteraction<CacheType>, options: handleAdminInsideAddUserDto) {
        await interaction.deferReply();
        const teamName = `pla${options.team}`;
        const teamRoleName = `plainsideteam${options.team}`;

        const member = await this.discordService.getMemberById(options.member.user.id);

        if (!member) {
            await interaction.editReply('## :x: Nie znaleziono użytkownika');
            return;
        }

        const insideRole = await this.roleService.findByName('plainside');
        const captainRole = await this.roleService.findByName('plainsidecaptain');
        const reserveRole = await this.roleService.findByName('plainsidereserve');
        const teamRole = await this.roleService.findByName(teamRoleName);
        const positionDisplayName = options.position === 'captain' ? 'kapitan' : options.position === 'reserve' ? 'rezerwowy' : 'członek';
        const teamDisplayName = plaTeamToNameDictionary[teamName];

        if (!insideRole) {
            await interaction.editReply('## :x: Nie znaleziono roli PLA Inside');
            return;
        }

        if (!captainRole) {
            await interaction.editReply('## :x: Nie znaleziono roli PLA Inside Captain');
            return;
        }

        if (!reserveRole) {
            await interaction.editReply('## :x: Nie znaleziono roli PLA Inside Reserve');
            return;
        }

        if (!teamRole) {
            await interaction.editReply('## :x: Nie znaleziono roli drużyny');
            return;
        }

        const memberRoles = member.roles.cache;

        if (memberRoles.has(insideRole.discordId)) {
            
            const continueButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Kontynuuj')
            .setCustomId('continue')
            .setEmoji('✅');
            
            const row = new ActionRowBuilder()
                .addComponents(continueButton);
            
            const confirmResponse = await interaction.editReply({
                content: '## :x: Użytkownik należy już do PLA Inside, kontynować?',
                components: [row as any],
            });

            let confirmation;

            const collectorFilter = i => i.user.id == interaction.user.id;

            try {
                confirmation = await confirmResponse.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            } catch (e) {
                await interaction.deleteReply();
            }

            confirmation.deferUpdate();
            interaction.editReply({
                content: `## Dodawanie użytkownika ${member} do PLA Inside...`,
                components: [],
            })
        }

        // Add member to PLA Inside
        await member.roles.add(insideRole.discordId);

        // Add member to team
        if (!memberRoles.has(teamRole.discordId)) {
            await member.roles.add(teamRole.discordId);
        }

        // Add member to captain or reserve
        if (options.position === 'captain' && !memberRoles.has(captainRole.discordId))
            await member.roles.add(captainRole.discordId);

        if (options.position === 'reserve' && !memberRoles.has(reserveRole.discordId))
            await member.roles.add(reserveRole.discordId);

        // Write private message to user
        const welcomeMessages = await this.getWelcomeMessages(options);
        for (const message of welcomeMessages) {
            await member.send(message);
        }

        // Update team boards
        interaction.editReply({
            content: `### Aktualizowanie tablic informacyjnych PLA Inside...`
        });

        await this.teamsCompositionService.updateInsideTeamBoards();

        interaction.editReply({
            content: `### :white_check_mark: Użytkownik ${member} został dodany do PLA Inside jako ${positionDisplayName} drużyny ${teamDisplayName}`,
        });
    }

    public async getWelcomeMessages (options: handleAdminInsideAddUserDto): Promise<{ content: string, embeds: any[], files: any[] }[]> {
        const teamEmoji = await this.emojiService.findByName(`pla${options.team}`);
        const insideEmoji = await this.emojiService.findByName('plainside');
        const teamName = plaTeamToNameDictionary[`pla${options.team}`];
        const teamsAmount = Object.keys(plaTeamToNameDictionary).length;
        
        const welcomeMessages = [];

        console.log(teamEmoji, teamEmoji.toString());

        let positionText = '';

        switch (options.position) {
            case 'captain':
                positionText = 'Jesteś **kapitanem** tej drużyny!';
                positionText += '\nKapitan odpowiada za organizację drużyny, ustala skład na mecze i jest osobą pierwszego kontaktu z kadrą PLA Inside.';
                break;
            case 'member':
                positionText = 'Jesteś teraz wartościowym członkiem zespołu na których pozostali gracze mogą liczyć! My również liczymy na Ciebie!';
                break;
            case 'reserve':
                positionText = 'Jesteś rezerwowym członkiem zespołu. W razie potrzeby będziesz mógł zastąpić gracza z podstawowego składu. Bądź gotowy na to wyzwanie!';
                break;
        }

        const message = [
            `# Witaj w **PLA Inside!** ${insideEmoji}`,
            `## Jesteś teraz oficjalnie członkiem naszej rodziny!`
        ];

        const plaImage = new AttachmentBuilder(this.configService.get<string>('images.pla-inside-background'));

        welcomeMessages.push({
            content: message.join('\n'),
            embeds: [],
            files: [plaImage],
        });

        let message2 = [
            `## Zostałeś dodany do drużyny **${teamName}** ${teamEmoji}`,
            positionText,
            `# ${insideEmoji} Czym jest PLA Inside?`,
            `PLA Inside to wewnętrzny klan serwera **Polskich Legend Apex**. To coś innego niż **PLA** i nie myl tych pojęć.`,
            `Klan dzieli się na wewnętrzne drużyny PLA, w tym twoją. Aktualnie istnieje **${teamsAmount}** drużyn:`,
        ];

        for (const teamKey in plaTeamToNameDictionary) {
            const emoji = await this.emojiService.findByName(teamKey);
            message2.push(`- ${emoji} ${plaTeamToNameDictionary[teamKey]}`);
        }

        message2 = [
            ...message2,
            `Niektóre mogą czekać na nowych zawodników ale każda z nich próbuje swoich sił w osiąganiu coraz to wyższych osiągnięć w Apex Legends.`,
            `Każda z tych drużyn posiada również własne logo w unikatowym kolorze, od tego właśnie powstaje nazwa! Niech te logo reprezentuje Was podczas osiągania postępów!`,
            `# ${insideEmoji} Czym zajmuje się PLA Inside?`,
            `- Przede wszystkim staramy się stworzyć przyjazne grono znajomych które czerpie radość z rywalizacyjnego grania w Apex Legends`,
            `- Tworzymy środowisko w którym każdy członek jest w stanie przekazać pozostałym elementy które wyćwiczył, tym samym dążąc do nieustającego poprawiania umiejętności`,
            `- Organizujemy **wewnętrzne 3v3** które umożliwia sprawdzenie się w rywalizacji z innymi drużynami PLA Inside`,
            `- Organizujemy **cotygodniowe treningi** na których wymieniamy się wiedzą i doświadczeniem`,
            `- Uczestniczymy w **zewnętrznych turniejach** razem próbując pokazać się w rankingach i zdobyć nagrody`,
            `### W PLA Inside możesz znaleźć miejsce dla siebie a także się rozwijać.`,
        ]

        welcomeMessages.push({
            content: message2.join('\n'),
            embeds: [],
            files: [],
        });

        let message3 = [
            `# ${insideEmoji} Czym są treningi PLA Inside?`,
            `**Treningi PLA Inside** to cotygodniowe spotkania w których wymieniamy się wiedzą i doświadczeniem. W trakcie treningów możesz zadać pytanie, poprosić o wytłumaczenie jakiegoś zagadnienia, poprosić o analizę swojej gry lub po prostu pogadać z innymi członkami.`,
            `Treningi są prowadzone przez **kadrę** lub **kapitanów drużyn** PLA Inside. W trakcie treningu kapitan może zaproponować zagadnienie do omówienia, temat do dyskusji lub po prostu zadać pytanie.`,
            `Co należy pamiętać to to że nawet jeśli nie czujesz potrzeby trenowania, to warto zrobić to dla pozostałych członków Inside. Może to być dla nich cenna lekcja, a dla ciebie okazja do przekazania swojej wiedzy.`,
            `### Jak to lubimy mówić: *Trening nie jest tylko dla ciebie, ale również dla pozostałych.*`,
        ];

        const trainingImage = new AttachmentBuilder(this.configService.get<string>('images.pla-inside-training-background'));

        welcomeMessages.push({
            content: message3.join('\n'),
            embeds: [],
            files: [trainingImage],
        })

        let message4 = [
            `# ${insideEmoji} Jak się rozwijać w PLA Inside?`,
            `- **Kapitan drużyny** to osoba której zadaniem będzie organizowanie wspólnego grania. Dodatkowe punkty dla kapitanów którzy prowadzą **grafik**. Choć to zadanie kapitana by organizować wspólne granie, pozostali członkowie jak najbardziej powinni w tym pomóc. Pamiętaj: *Jesteś tutaj by grać w Apex Legends, bez tego nie ma PLA Inside*.`,
            `- Bardzo ważne jest byście organizowali **wewnętrzne treningi**. Pamiętaj, że treningi PLA Inside mają wykorzystywać fakt, że zbieramy się wszyscy razem. Pozostałe ćwiczenia jak np. **1v1 dla rozgrzania**, **zdobywanie umocnień**, **wykorzystywanie umiejętności legend**, itp. możecie wykonywać w dowolnym momencie. Dodatkowe punkty dla kapitanów którzy śledzą postępy składu.`,
            `- Starajcie się grać ze sobą jak najczęściej. Nie ma nic bardziej opóźniającego rozwój niż członek który nie gra z resztą składu. W składzie musicie stać się **jednością** i rozumieć siebie bez słów. Dodatkowe punkty dla członków którzy wymyślają nowe taktyki, które możecie realizować podczas grania.`,
            `- Wymieniajcie się uwagami dotyczącymi gry. Jeśli widzisz że ktoś popełnia błąd, to nie bój się mu o tym powiedzieć. Nie ma nic gorszego niż członek który **nie słucha uwag**. Dodatkowe punkty dla drużyn, które potrafią przyjąć krytykę i wykorzystać ją do poprawy swojej gry a także takich które nagrywają swoje rozgrywki by je analizować.`,
            `- Wymyślajcie nowe połączenia legend, nowe taktyki, nowe sposoby na wykorzystanie umiejętności. Stwórzcie swój własny styl gry i wykorzystajcie go do osiągnięcia sukcesu.`,
            `- A przede wszystkim, to **TY staraj się być jak najlepszym graczem**. Nie ma nic bardziej motywującego niż widok kolegi który rozwija się razem z tobą.`,
        ];

        welcomeMessages.push({
            content: message4.join('\n'),
            embeds: [],
            files: [],
        });

        let message5 = [
            `# ${insideEmoji} Jak poruszać się po PLA Inside?`,
            `Wszystkie kanały PLA Inside znajdują się w kategorii **PLA Inside**.`,
            `### Poniżej znajdują się główne kanały informacyjne:`,
            ``,
            `<#1099095089877356565> - Kanał ogłoszeniowy, tutaj znajdziesz najważniejsze informacje dotyczące PLA Inside`,
            `<#1050477461080645673> - Kanał z wydarzeniami, tutaj znajdziesz informacje o spotkaniach i treningach, nie zapomnij o obowiązkowym potwierdzeniu swojej obecności!`,
            `<#1131206565815386202> - Kanał ze scrimami, tutaj znajdziesz informacje o zewnętrznych scrimach, w których możecie zmierzyć się z lepszymi graczami.`,
            `### Kanały na których można porozmawiać:`,
            `<#1050477201843302540> - Główny kanał na którym rozmawiają wszyscy członkowie PLA Inside`,
            `<#1050477461080645673> - Kanał na którym prowadzone są dyskusje na temat turniejów, scrimów i innych elementów e-sportowych`,
            ``,
            `### Na koniec, **wasz kanał**.`,
            `Każda drużyna ma swój kanał na którym możecie rozmawiać i wymieniać się informacjami. Wbrew intuicji, kanały te są otwarte dla pozostałych członków PLA Inside. Pozwala to motywować siebie nawzajem. Pamiętaj, że PLA Inside to jedna rodzina i każdy może się wypowiedzieć na każdy temat, jednak uszanujmy czasem prywatność innych.`,
            `Wasz kanał może korzystać z wątków Discorda - pozwala to na lepszą organizację rozmów i łatwiejsze wyszukiwanie informacji. Dodatkowe punkty dla kapitanów którzy używają wątków do organizacji zespołu.`,
            ``,
            `## To już wszystko! ${insideEmoji}`,
            `Mamy nadzieję że będziesz się dobrze bawił w PLA Inside! Wejdź na <#1050477201843302540> i powiedz wszystkim potężne **CZEŚĆ!**`,
        ];

        welcomeMessages.push({
            content: message5.join('\n'),
            embeds: [],
            files: [],
        });

        return welcomeMessages;
    }
}