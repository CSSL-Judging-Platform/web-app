import { supabase } from "./supabase"

// Big Events API
export const bigEventsApi = {
  async getAll() {
    const { data, error } = await supabase.from("big_events").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("big_events").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async create(event: any) {
    const { data, error } = await supabase.from("big_events").insert(event).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, event: any) {
    const { data, error } = await supabase.from("big_events").update(event).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    await supabase.from("competitions").delete().eq("big_event_id", id);
    
    const { error } = await supabase.from("big_events").delete().eq("id", id)

    if (error) throw error
  },

  async updateStatus(id: string, status: "draft" | "active" | "completed" | "cancelled") {
    const { data, error } = await supabase
        .from("big_events")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
    }
}

// Competitions API
export const competitionsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("competitions")
      .select(`
        *,
        big_events(name),
        contestants(count),
        judge_assignments(count)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("competitions")
      .select(`
        *,
        big_events(name),
        judging_criteria(*),
        contestants(*),
        judge_assignments(*, profiles(full_name, email))
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  async create(competition: any) {
    const { data, error } = await supabase.from("competitions").insert(competition).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, competition: any) {
    const { data, error } = await supabase.from("competitions").update(competition).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from("competitions").delete().eq("id", id)

    if (error) throw error
  },

    async updateStatus(id: string, status: "draft" | "active" | "completed") {
        const { data, error } = await supabase
            .from("competitions")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

  async getAvailableJudges(competitionId: string) {
    // Get judges not already assigned to this competition
    const { data, error } = await supabase.rpc('get_available_judges', {
      competition_id: competitionId
    });

    if (error) throw error;
    return data || [];
  }
  
}

// Judges API
export const judgesApi = {
  
  async getAll() {
    const { data, error } = await supabase
      .from("judges")
      .select(`
        *,
        profile:profiles(full_name, email, is_active, created_at),
        judge_assignments(count),
        scores(count)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("judges")
      .select(`
        *,
        profile:profiles(full_name, email, is_active, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(judgeData: any) {
    // First create the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        full_name: judgeData.full_name,
        email: judgeData.email,
        role: "judge",
        password: judgeData.password,
        is_active: true
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Then create the judge record
    const { data, error } = await supabase
      .from("judges")
      .insert({
        profile_id: profile.id,
        expertise: judgeData.expertise,
        bio: judgeData.bio
      })
      .select()
      .single();

    if (error) {
      // Rollback profile creation if judge creation fails
      await supabase.from("profiles").delete().eq("id", profile.id);
      throw error;
    }

    return { ...data, profile };
  },

  async update(id: string, judgeData: any) {
    // Update both profile and judge records
    const { data: judge, error: judgeError } = await supabase
      .from("judges")
      .update({
        expertise: judgeData.expertise,
        bio: judgeData.bio
      })
      .eq("id", id)
      .select()
      .single();

    if (judgeError) throw judgeError;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: judgeData.full_name,
        email: judgeData.email,
        is_active: judgeData.is_active
      })
      .eq("id", judge.profile_id)
      .select()
      .single();

    if (profileError) throw profileError;

    return { ...judge, profile };
  },

  async delete(id: string) {
    // First get the profile_id
    const { data: judge, error: judgeError } = await supabase
      .from("judges")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (judgeError) throw judgeError;

    // Delete judge assignments first
    await supabase.from("judge_assignments").delete().eq("judge_id", id);
    
    // Then delete the judge record
    await supabase.from("judges").delete().eq("id", id);
    
    // Finally delete the profile
    await supabase.from("profiles").delete().eq("id", judge.profile_id);
  },

  async getAssignments(judgeId: string) {
    const { data, error } = await supabase
      .from("judge_assignments")
      .select(`
        *,
        competition:competitions(
          *,
          big_event:big_events(name)
        )
      `)
      .eq("judge_id", judgeId)
      .order("assigned_at", { ascending: false });

    if (error) throw error;
    
    // Transform the data to make it more usable
    return (data || []).map(assignment => ({
      ...assignment,
      competition: {
        ...assignment.competition,
        // Add a computed field for display purposes
        full_name: assignment.competition.big_event 
          ? `${assignment.competition.big_event.name} - ${assignment.competition.name}`
          : assignment.competition.name
      }
    }));
  },

  async assignToCompetition(judgeId: string, competitionId: string, assignedByProfileId: string) {
  const { data, error } = await supabase
    .from("judge_assignments")
    .insert({
      judge_id: judgeId,
      competition_id: competitionId,
      assigned_by: assignedByProfileId
    })
    .select(`
      *,
      competition:competitions(
        id,
        name,
        status,
        big_event:big_events(name)
      )
    `)
    .single();

  if (error) throw error;
  return data;
},

  async removeAssignment(assignmentId: string) {
    const { error } = await supabase
      .from("judge_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) throw error;
  }
}

// Contestants API
export const contestantsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("contestants")
      .select(`
        *,
        competitions(name),
        scores(score)
      `)
      .order("registered_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getByCompetition(competitionId: string) {
    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("competition_id", competitionId)
      .order("registered_at")

    if (error) throw error
    return data || []
  },

  async create(contestant: any) {
    const { data, error } = await supabase.from("contestants").insert(contestant).select().single()

    if (error) throw error
    return data
  },

  async update(id: string, contestant: any) {
    const { data, error } = await supabase.from("contestants").update(contestant).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from("contestants").delete().eq("id", id)

    if (error) throw error
  },

  async bulkCreate(contestants: any[]) {
    const { data, error } = await supabase.from("contestants").insert(contestants).select()

    if (error) throw error
    return data
  },
}

// Analytics API
export const analyticsApi = {
  async getOverview() {
    const [
      { count: totalCompetitions },
      { count: activeCompetitions },
      { count: totalJudges },
      { count: totalContestants },
      { data: averageScoreData }
    ] = await Promise.all([
      supabase.from('competitions').select('*', { count: 'exact', head: true }),
      supabase.from('competitions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'judge'),
      supabase.from('contestants').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_average_score')
    ]);

    return {
      totalCompetitions: totalCompetitions || 0,
      activeCompetitions: activeCompetitions || 0,
      totalJudges: totalJudges || 0,
      totalContestants: totalContestants || 0,
      averageScore: averageScoreData?.[0]?.average_score || 0
    };
  },

  async getCompetitionStats() {
    const { data, error } = await supabase.rpc('get_competition_stats');
    if (error) {
      console.error("Error fetching competition stats:", error);
      return [];
    }
    return data || [];
  },

  async getJudgePerformance() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        judge_assignments:judge_assignments!judge_assignments_judge_id_fkey(count),
        scores!scores_judge_id_fkey(
          score
        )
      `)
      .eq('role', 'judge');

    if (error) throw error;

    return data?.map(judge => {
      const scores = judge.scores || [];
      const scoreValues = scores.map(s => s.score).filter(Boolean);
      
      // Calculate consistency
      let consistency = 100;
      if (scoreValues.length > 1) {
        const avgScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
        const squaredDiffs = scoreValues.map(s => Math.pow(s - avgScore, 2));
        const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length);
        consistency = Math.max(0, 100 - (stdDev * 10));
      }

      return {
        judge_id: judge.id,
        name: judge.full_name,
        assigned_competitions: judge.judge_assignments?.[0]?.count || 0,
        completed_evaluations: scores.length,
        consistency_score: Math.round(consistency),
        average_time_per_evaluation: 0 // Default value since time_spent doesn't exist
      };
    }) || [];
  },

  async getMonthlyTrends() {
    // Using a stored procedure for more complex queries
    const { data, error } = await supabase.rpc('get_monthly_trends');
    
    if (error) {
      console.error("Error fetching monthly trends:", error);
      // Return mock data if the function doesn't exist
      return [
        { month: "Jan", competitions: 2, participants: 15 },
        { month: "Feb", competitions: 3, participants: 25 },
        { month: "Mar", competitions: 4, participants: 35 },
        { month: "Apr", competitions: 3, participants: 28 },
        { month: "May", competitions: 5, participants: 42 },
      ];
    }

    return data || [];
  },
}

// Add these to your existing API file

// Evaluations API
export const evaluationsApi = {
  async getEvaluationProgress(competitionId: string) {
    try {
      const { data, error } = await supabase.rpc('get_evaluation_counts', {
        competition_id: competitionId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error in getEvaluationProgress:", error);
      // Fallback to manual calculation if function doesn't exist
      return this.calculateEvaluationProgress(competitionId);
    }
  },

  async calculateEvaluationProgress(competitionId: string) {
    // Manual calculation fallback
    const { data: contestants } = await supabase
      .from('contestants')
      .select('id, name')
      .eq('competition_id', competitionId);

    const { data: judgeAssignments } = await supabase
      .from('judge_assignments')
      .select('judge_id, competition_id')
      .eq('competition_id', competitionId);

    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('competition_id', competitionId);

    return contestants?.map(contestant => {
      const contestantScores = scores?.filter(s => s.contestant_id === contestant.id) || [];
      const evaluationsCompleted = contestantScores.length;
      const judgesAssigned = judgeAssignments?.length || 0;
      const totalScore = contestantScores.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = evaluationsCompleted > 0 ? totalScore / evaluationsCompleted : 0;

      return {
        contestant_id: contestant.id,
        contestant_name: contestant.name,
        judges_assigned: judgesAssigned,
        evaluations_completed: evaluationsCompleted,
        average_score: averageScore,
        evaluation_status: evaluationsCompleted === 0 ? 'pending' : 
                          evaluationsCompleted < judgesAssigned ? 'in progress' : 'completed'
      };
    }) || [];
  }
};

export const dashboardApi = {
  async getStats() {
    return await analyticsApi.getOverview()
  },

  // New method for judge-specific stats
  async getJudgeStats(judgeId: string) {
    const { data: assignments } = await supabase
      .from('judge_assignments')
      .select('competition_id')
      .eq('judge_id', judgeId);

    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('judge_id', judgeId);

    const completedEvaluations = scores?.length || 0;
    const assignedEvents = assignments?.length || 0;
    
    return {
      assignedEvents,
      judgingProgress: assignedEvents > 0 
        ? Math.round((completedEvaluations / assignedEvents) * 100)
        : 0,
      pendingReviews: assignedEvents - completedEvaluations
    };
  },

  // New method for contestant-specific stats
  async getContestantStats(contestantId: string) {
    const { data: registrations } = await supabase
      .from('contestants')
      .select('competition_id')
      .eq('id', contestantId);

    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('contestant_id', contestantId);

    const averageScore = scores?.length 
      ? (scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length).toFixed(1)
      : 0;

    return {
      registeredEvents: registrations?.length || 0,
      judgingStatus: scores?.length ? 'Completed' : 'Pending',
      averageScore
    };
  },

  // New method for recent activity (admin only)
  async getRecentActivity() {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    return data || [];
  }
};
