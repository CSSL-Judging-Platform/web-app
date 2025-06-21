import { supabase } from './supabaseClient';

type ActivityParams = {
  userId: string;
  actionType: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, any>;
};

export const activityService = {
  async logActivity(params: ActivityParams) {
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        user_id: params.userId,
        action_type: params.actionType,
        entity_type: params.entityType,
        entity_id: params.entityId,
        description: params.description,
        metadata: params.metadata
      }])
      .select();

    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }

    return data;
  },

  // Common activity types as constants
  ActivityType: {
    LOGIN: 'user_login',
    CREATE_EVENT: 'create_event',
    UPDATE_EVENT: 'update_event',
    DELETE_EVENT: 'delete_event',
    CREATE_COMPETITION: 'create_competition',
    REGISTER_CONTESTANT: 'register_contestant',
    SUBMIT_SCORE: 'submit_score',
    // Add more as needed
  }
};