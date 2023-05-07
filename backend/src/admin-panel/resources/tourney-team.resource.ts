import { TourneyTeamEntity } from 'src/database/entities/tourney/entities/team/entities/tourney-team.entity';

export const TourneyTeamResource = {
    resource: TourneyTeamEntity,
    options: {
        listProperties: ['id', 'name', 'logoLink', 'createdAt', 'updatedAt', 'tourney'],
        filterProperties: ['id', 'name', 'logoLink', 'tourney'],
        editProperties: ['name', 'logoLink', 'tourney'],
        showProperties: ['id', 'name', 'logoLink', 'createdAt', 'updatedAt', 'tourney'],
    },
}