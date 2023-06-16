/* eslint-disable */
export type Schema = {
  'apex_account': {
    plain: {
      'id': number;
      'name': string;
      'uid': string;
      'avatar_url': string;
      'platform': string;
      'rank_score': number;
      'rank_name': string;
      'rank_division': string;
      'rank_img': string;
      'level': number;
      'percent_to_next_level': number;
      'br_total_kills': number;
      'br_total_wins': number;
      'br_total_games_played': number;
      'br_kdr': number;
      'br_total_damage': number;
      'last_legend_played': string;
      'created_at': string;
      'updated_at': string;
    };
    nested: {
      'user': Schema['user']['plain'] & Schema['user']['nested'];
    };
    flat: {
      'user:id': number;
      'user:discord_id': string;
      'user:email': string;
      'user:is_admin': number;
      'user:created_at': string;
      'user:updated_at': string;
      'user:apexAccountId': number;
    };
  };
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
  'emoji': {
    plain: {
      'id': number;
      'name': string;
      'discord_id': string;
      'created_at': string;
      'updated_at': string;
      'discord_name': string;
    };
    nested: {};
    flat: {};
  };
  'message': {
    plain: {
      'id': number;
      'discord_id': string;
      'name': string;
      'created_at': string;
      'updated_at': string;
      'channelId': number;
      'userId': number;
    };
    nested: {
      'channel': Schema['channel']['plain'] & Schema['channel']['nested'];
      'user': Schema['user']['plain'] & Schema['user']['nested'];
    };
    flat: {
      'channel:id': number;
      'channel:discord_id': string;
      'channel:name': string;
      'channel:type': 'text' | 'voice';
      'channel:created_at': string;
      'channel:updated_at': string;
      'user:id': number;
      'user:discord_id': string;
      'user:email': string;
      'user:is_admin': number;
      'user:created_at': string;
      'user:updated_at': string;
      'user:apexAccountId': number;
      'user:apexAccount:id': number;
      'user:apexAccount:name': string;
      'user:apexAccount:uid': string;
      'user:apexAccount:avatar_url': string;
      'user:apexAccount:platform': string;
      'user:apexAccount:rank_score': number;
      'user:apexAccount:rank_name': string;
      'user:apexAccount:rank_division': string;
      'user:apexAccount:rank_img': string;
      'user:apexAccount:level': number;
      'user:apexAccount:percent_to_next_level': number;
      'user:apexAccount:br_total_kills': number;
      'user:apexAccount:br_total_wins': number;
      'user:apexAccount:br_total_games_played': number;
      'user:apexAccount:br_kdr': number;
      'user:apexAccount:br_total_damage': number;
      'user:apexAccount:last_legend_played': string;
      'user:apexAccount:created_at': string;
      'user:apexAccount:updated_at': string;
    };
  };
  'role': {
    plain: {
      'id': number;
      'discord_id': string;
      'name': string;
      'created_at': string;
      'updated_at': string;
      'priority': number;
      'emojiId': number;
      'roleGroupId': number;
    };
    nested: {
      'emoji': Schema['emoji']['plain'] & Schema['emoji']['nested'];
      'roleGroup': Schema['role_group']['plain'] & Schema['role_group']['nested'];
    };
    flat: {
      'emoji:id': number;
      'emoji:name': string;
      'emoji:discord_id': string;
      'emoji:created_at': string;
      'emoji:updated_at': string;
      'emoji:discord_name': string;
      'roleGroup:id': number;
      'roleGroup:name': string;
      'roleGroup:created_at': string;
      'roleGroup:updated_at': string;
    };
  };
  'role_group': {
    plain: {
      'id': number;
      'name': string;
      'created_at': string;
      'updated_at': string;
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
      'apexAccountId': number;
    };
    nested: {
      'apexAccount': Schema['apex_account']['plain'] & Schema['apex_account']['nested'];
    };
    flat: {
      'apexAccount:id': number;
      'apexAccount:name': string;
      'apexAccount:uid': string;
      'apexAccount:avatar_url': string;
      'apexAccount:platform': string;
      'apexAccount:rank_score': number;
      'apexAccount:rank_name': string;
      'apexAccount:rank_division': string;
      'apexAccount:rank_img': string;
      'apexAccount:level': number;
      'apexAccount:percent_to_next_level': number;
      'apexAccount:br_total_kills': number;
      'apexAccount:br_total_wins': number;
      'apexAccount:br_total_games_played': number;
      'apexAccount:br_kdr': number;
      'apexAccount:br_total_damage': number;
      'apexAccount:last_legend_played': string;
      'apexAccount:created_at': string;
      'apexAccount:updated_at': string;
    };
  };
};
