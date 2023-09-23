import { Module, forwardRef } from '@nestjs/common';
import { CommunityEventsService } from './community-events.service';
import { CommunityEventModule } from 'src/database/entities/community-event/community-event.module';
import { DiscordModule } from '../discord.module';
import { UserModule } from 'src/database/entities/user/user.module';
import { RoleModule } from 'src/database/entities/role/role.module';
import { ChannelModule } from 'src/database/entities/channel/channel.module';

@Module({
    imports: [
        CommunityEventModule,
        UserModule,
        RoleModule,
        ChannelModule,
        forwardRef(() => DiscordModule),
    ],
    providers: [
        CommunityEventsService
    ],
    exports: [
        CommunityEventsService
    ],
})
export class CommunityEventsModule {}
