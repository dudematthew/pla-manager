import { ChannelEntity } from 'src/database/entities/channel/channel.entity';

export const ChannelResource = {
    resource: ChannelEntity,
    options: {
        listProperties: ['id', 'name', 'discordId', 'createdAt', 'updatedAt'],
        filterProperties: ['id', 'discordId', 'name', 'type'],
        editProperties: ['name', 'discordId', 'type'],
        showProperties: ['id', 'discordId', 'name', 'createdAt', 'updatedAt'],
    },
}