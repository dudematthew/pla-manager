/* eslint-disable */
export type Schema = {
  'channel': {
    plain: {
      'id': number;
      'discord_id': string;
      'name': string;
      'type': 'text' | 'voice';
      'created_at': string;
      'updated_at': string;
    };
    nested: {};
    flat: {};
  };
  'role': {
    plain: {
      'id': number;
      'discord_id': string;
      'name': string;
      'created_at': string;
      'updated_at': string;
      'priority': number;
    };
    nested: {};
    flat: {};
  };
  'sessions': {
    plain: {
      'expiredAt': number;
      'id': string;
      'destroyedAt': string;
      'json': string;
    };
    nested: {};
    flat: {};
  };
  'tourney': {
    plain: {
      'id': number;
      'name': string;
      'image_link': string;
      'created_at': string;
      'updated_at': string;
      'thumbnail_link': string;
      'description': string;
      'discord_description': string;
      'start_date': string;
    };
    nested: {};
    flat: {};
  };
  'tourney_team': {
    plain: {
      'id': number;
      'name': string;
      'logoLink': string;
      'created_at': string;
      'updated_at': string;
      'tourneyId': number;
      'number': number;
    };
    nested: {
      'tourney': Schema['tourney']['plain'] & Schema['tourney']['nested'];
    };
    flat: {
      'tourney:id': number;
      'tourney:name': string;
      'tourney:image_link': string;
      'tourney:created_at': string;
      'tourney:updated_at': string;
      'tourney:thumbnail_link': string;
      'tourney:description': string;
      'tourney:discord_description': string;
      'tourney:start_date': string;
    };
  };
  'user': {
    plain: {
      'id': number;
      'discord_id': string;
      'email': string;
      'is_admin': number;
      'created_at': string;
      'updated_at': string;
    };
    nested: {};
    flat: {};
  };
};
