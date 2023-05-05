import { UserEntity } from '../../database/entities/user/user.entity';
import { Components } from '../components/components';

export const UserResource = {
    resource: UserEntity,
    options: {
        // properties: {
        //     username: {
        //         type: 'string',
        //         // isTitle: true,
        //         components: {
        //             list: (props) => {
        //                 console.log(props);
        //             },
        //             show: Components.MyInput,
        //         },
        //         options: {
        //             isTitle: true,
        //         }
        //     }
        // },
        listProperties: ['id', 'discordId', 'email', 'createdAt', 'updatedAt', 'isAdmin'],
        filterProperties: ['id', 'discordId', 'email', 'isAdmin'],
        editProperties: ['email', 'isAdmin', 'discordId'],
        showProperties: ['id', 'discordId', 'email', 'createdAt', 'updatedAt', 'isAdmin'],
    },
}