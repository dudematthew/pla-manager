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
  'apex_account_history': {
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
      'apexAccount:user:id': number;
      'apexAccount:user:discord_id': string;
      'apexAccount:user:email': string;
      'apexAccount:user:is_admin': number;
      'apexAccount:user:created_at': string;
      'apexAccount:user:updated_at': string;
      'apexAccount:user:apexAccountId': number;
    };
  };
  'apex_season': {
    plain: {
      'id': number;
      'name': string;
      'tagline': string;
      'current_split': number;
      'start_date': string;
      'end_date': string;
      'split_date': string;
      'color': string;
      'link': string;
      'new_legend': string;
      'new_weapon': string;
      'new_map': string;
      'created_at': string;
      'updated_at': string;
    };
    nested: {};
    flat: {};
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
  'community_events': {
    plain: {
      'id': number;
      'name': string;
      'description': string;
      'start_date': string;
      'end_date': string;
      'image_url': string;
      'approve_state': 'pending' | 'approved' | 'rejected';
      'created_at': string;
      'updated_at': string;
      'userId': number;
      'color': string;
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
  'inside_league_match': {
    plain: {
      'id': number;
      'created_at': string;
      'updated_at': string;
      'seasonId': number;
    };
    nested: {
      'season': Schema['inside_league_season']['plain'] & Schema['inside_league_season']['nested'];
    };
    flat: {
      'season:id': number;
      'season:name': string;
      'season:background_image': string;
      'season:created_at': string;
      'season:updated_at': string;
    };
  };
  'inside_league_match_score': {
    plain: {
      'id': number;
      'score': number;
      'created_at': string;
      'updated_at': string;
      'teamId': number;
      'matchId': number;
    };
    nested: {
      'team': Schema['team']['plain'] & Schema['team']['nested'];
      'match': Schema['inside_league_match']['plain'] & Schema['inside_league_match']['nested'];
    };
    flat: {
      'team:id': number;
      'team:name': string;
      'team:created_at': string;
      'team:updated_at': string;
      'team:roleId': number;
      'team:display_name': string;
      'team:logo_url': string;
      'team:color': string;
      'team:role:id': number;
      'team:role:discord_id': string;
      'team:role:name': string;
      'team:role:created_at': string;
      'team:role:updated_at': string;
      'team:role:priority': number;
      'team:role:emojiId': number;
      'team:role:roleGroupId': number;
      'team:role:emoji:id': number;
      'team:role:emoji:name': string;
      'team:role:emoji:discord_id': string;
      'team:role:emoji:created_at': string;
      'team:role:emoji:updated_at': string;
      'team:role:emoji:discord_name': string;
      'team:role:roleGroup:id': number;
      'team:role:roleGroup:name': string;
      'team:role:roleGroup:created_at': string;
      'team:role:roleGroup:updated_at': string;
      'match:id': number;
      'match:created_at': string;
      'match:updated_at': string;
      'match:seasonId': number;
      'match:season:id': number;
      'match:season:name': string;
      'match:season:background_image': string;
      'match:season:created_at': string;
      'match:season:updated_at': string;
    };
  };
  'inside_league_season': {
    plain: {
      'id': number;
      'name': string;
      'background_image': string;
      'created_at': string;
      'updated_at': string;
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
      'team': Schema['team']['plain'] & Schema['team']['nested'];
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
      'team:id': number;
      'team:name': string;
      'team:created_at': string;
      'team:updated_at': string;
      'team:roleId': number;
      'team:display_name': string;
      'team:logo_url': string;
      'team:color': string;
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
  'team': {
    plain: {
      'id': number;
      'name': string;
      'created_at': string;
      'updated_at': string;
      'roleId': number;
      'display_name': string;
      'logo_url': string;
      'color': string;
    };
    nested: {
      'role': Schema['role']['plain'] & Schema['role']['nested'];
    };
    flat: {
      'role:id': number;
      'role:discord_id': string;
      'role:name': string;
      'role:created_at': string;
      'role:updated_at': string;
      'role:priority': number;
      'role:emojiId': number;
      'role:roleGroupId': number;
      'role:emoji:id': number;
      'role:emoji:name': string;
      'role:emoji:discord_id': string;
      'role:emoji:created_at': string;
      'role:emoji:updated_at': string;
      'role:emoji:discord_name': string;
      'role:roleGroup:id': number;
      'role:roleGroup:name': string;
      'role:roleGroup:created_at': string;
      'role:roleGroup:updated_at': string;
    };
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
