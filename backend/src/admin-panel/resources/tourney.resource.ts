import { TourneyEntity } from "src/database/entities/tourney/entities/tourney.entity";

export const TourneyResource = {
    resource: TourneyEntity,
    options: {
        listProperties: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        filterProperties: ['id', 'name', 'description', 'teams'],
        editProperties: ['name', 'description', 'discordDescription', 'imageLink', 'thumbnailLink'],
        showProperties: ['id', 'name', 'description', 'discordDescription', 'imageLink', 'thumbnailLink', 'createdAt', 'updatedAt'],
    },
}