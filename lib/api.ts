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
  },

  async createCriteria(criteria: any) {
    const { data, error } = await supabase
      .from('judging_criteria')
      .insert(criteria)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCriteria(id: string, criteria: any) {
    const { data, error } = await supabase
      .from('judging_criteria')
      .update(criteria)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCriteria(id: string) {
    const { error } = await supabase
      .from('judging_criteria')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderCriteria(competitionId: string, updates: Array<{id: string, name:string, description:string, 
    max_points:number, weight:number, competition_id: string, order_index: number}>) {

    const { data, error } = await supabase
      .from('judging_criteria')
      .upsert(updates)
      .select();

    if (error) throw error;
    return data;
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
  }, 

  async getJudgeAssignments(judgeId: string) {
    if (!judgeId) return [];

    const { data: judge, error: judgeError } = await supabase
      .from("judges")
      .select("id")
      .eq("profile_id", judgeId)
      .single();
    
    const { data, error } = await supabase
      .from('judge_assignments')
      .select(`
        id,
        competition_id,
        competitions:competition_id (
          id,
          name,
          description,
          start_date,
          end_date,
          status
        )
      `)
      .eq('judge_id', judge.id);

    if (error) {
      console.error('Error fetching judge assignments:', error);
      throw error;
    }

    return data.map(assignment => assignment.competitions) || [];
  },

  // Get contestants for a competition
  async getContestants(competitionId: string) {
    if (!competitionId) return [];
    
    const { data, error } = await supabase
      .from('contestants')
      .select(`
        id,
        contestant_name,
        contestant_email,
        registration_number,
        additional_info,
        registered_at
      `)
      .eq('competition_id', competitionId)
      .order('contestant_name', { ascending: true });

    if (error) {
      console.error('Error fetching contestants:', error);
      throw error;
    }

    return data || [];
  },

  // Get judging criteria for a competition
  async getJudgingCriteria(competitionId: string) {
    if (!competitionId) return [];
    
    const { data, error } = await supabase
      .from('judging_criteria')
      .select(`
        id,
        name,
        description,
        max_points,
        weight,
        order_index
      `)
      .eq('competition_id', competitionId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching judging criteria:', error);
      throw error;
    }

    return data || [];
  },

  // Get existing scores for a contestant
  async getScores(judgeId: string, contestantId: string) {
    if (!judgeId || !contestantId) return [];
    
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        criteria_id,
        score,
        feedback,
        is_draft
      `)
      .eq('judge_id', judgeId)
      .eq('contestant_id', contestantId);

    if (error) {
      console.error('Error fetching scores:', error);
      throw error;
    }

    return data || [];
  },

  async getScoresForJudge(judgeId: string) {
    if (!judgeId) return [];
    
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        criteria_id,
        score,
        feedback,
        is_draft
      `)
      .eq('judge_id', judgeId);

    if (error) {
      console.error('Error fetching scores:', error);
      throw error;
    }

    return data || [];
  },

  // Save scores (create or update)
  async saveScores(params: {
    judgeId: string;
    contestantId: string;
    scores: {
      criteria_id: string;
      score: number;
      feedback: string;
    }[];
    isDraft: boolean;
  }) {
    const { judgeId, contestantId, scores, isDraft } = params;

    const { data: judge, error: judgeError } = await supabase
      .from("judges")
      .select("id")
      .eq("profile_id", judgeId)
      .single();

    // First delete any existing scores for this judge/contestant combination
    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('judge_id', judge.id)
      .eq('contestant_id', contestantId);

    if (deleteError) {
      console.error('Error deleting existing scores:', deleteError);
      throw deleteError;
    }

    // Insert new scores
    const scoreRecords = scores.map(score => ({
      judge_id: judge.id,
      contestant_id: contestantId,
      criteria_id: score.criteria_id,
      score: score.score,
      feedback: score.feedback,
      is_draft: isDraft,
    }));

    const { data, error } = await supabase
      .from('scores')
      .insert(scoreRecords)
      .select();

    if (error) {
      console.error('Error saving scores:', error);
      throw error;
    }

    return data;
  },

  // Log activity when scores are saved/submitted
  async logJudgingActivity(params: {
    judgeId: string;
    contestantId: string;
    actionType: 'save_draft' | 'submit_scores';
  }) {

    const { data: judge, error: judgeError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', params.judgeId)
      .single()

    const contestant = await supabase
      .from('contestants')
      .select('contestant_name')
      .eq('id', params.contestantId)
      .single();

    if (contestant.error) {
      console.error('Error fetching contestant:', contestant.error);
      return;
    }

    await supabase.from('activities').insert({
      user_id: params.judgeId,
      action_type: params.actionType,
      entity_type: 'contestant',
      entity_id: params.contestantId,
      description: params.actionType === 'save_draft' 
        ? `Saved draft scores for ${contestant.data.contestant_name} by ${judge.full_name}`
        : `Submitted final scores for ${contestant.data.contestant_name} by ${judge.full_name}`,
    });
  },

  async getFinalScores(contestantId: string) {
    if (!contestantId) return [];
    
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        criteria_id,
        score,
        feedback,
        judging_criteria:criteria_id(name, max_points, weight)
      `)
      .eq('contestant_id', contestantId)
      .eq('is_draft', false);

    if (error) {
      console.error('Error fetching final scores:', error);
      throw error;
    }

    return data || [];
  },

  async getContestantRankings(competitionId: string) {
    if (!competitionId) return [];
    
    const { data, error } = await supabase.rpc('get_contestant_rankings', {
      competition_id: competitionId
    });

    if (error) {
      console.error('Error fetching contestant rankings:', error);
      // Fallback to manual calculation
      return this.calculateContestantRankings(competitionId);
    }

    return data || [];
  },

  async calculateContestantRankings(competitionId: string) {
    const { data: contestants, error: contestantError } = await supabase
      .from('contestants')
      .select('id, contestant_name')
      .eq('competition_id', competitionId);

    if (contestantError) throw contestantError;

    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('contestant_id, score')
      .eq('competition_id', competitionId)
      .eq('is_draft', false);

    if (scoresError) throw scoresError;

    const results = contestants.map(contestant => {
      const contestantScores = scores.filter(s => s.contestant_id === contestant.id);
      const totalScore = contestantScores.reduce((sum, s) => sum + (s.score || 0), 0);
      const scoreCount = contestantScores.length;
      const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

      return {
        contestant_id: contestant.id,
        contestant_name: contestant.contestant_name,
        total_score: totalScore,
        average_score: averageScore,
        score_count: scoreCount
      };
    });

    // Sort by average score descending
    return results.sort((a, b) => b.average_score - a.average_score);
  },

  // Updated getContestantScoresForCompetition
  async getContestantScoresForCompetition(judgeId: string, competitionId: string): Promise<ContestantScore[]> {
    // First get the judge record from profile ID
    const { data: judge, error: judgeError } = await supabase
      .from('judges')
      .select('id')
      .eq('profile_id', judgeId)
      .single()

    if (judgeError) throw judgeError

    // Get all contestants for the competition
    const { data: contestants, error: contestantsError } = await supabase
      .from('contestants')
      .select('id, contestant_name, registration_number')
      .eq('competition_id', competitionId)

    if (contestantsError) throw contestantsError

    // Get judging criteria count for max possible score
    const { data: criteria, error: criteriaError } = await supabase
      .from('judging_criteria')
      .select('id, max_points')
      .eq('competition_id', competitionId)

    if (criteriaError) throw criteriaError

    const maxPossible = criteria.reduce((sum, criterion) => sum + criterion.max_points, 0)

    // Get all scores for contestants in this competition
    // We need to join with contestants to filter by competition
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select(`
        judge_id, 
        contestant_id,
        criteria_id, 
        score, 
        is_draft,
        contestants:contestant_id(competition_id)
      `)
      .in('contestant_id', contestants.map(c => c.id))

    if (scoresError) throw scoresError

    // Filter scores to only include those for this competition
    // (though our contestant filter should already ensure this)
    const competitionScores = allScores.filter(score => 
      score.contestants?.competition_id === competitionId
    )

    // Process data to calculate judge scores and averages
    const result = contestants.map(contestant => {
      // Get this judge's scores for the contestant
      const judgeScores = competitionScores.filter(
        score => score.judge_id === judge.id && score.contestant_id === contestant.id && !score.is_draft
      )
      const judgeScore = judgeScores.reduce((sum, score) => sum + score.score, 0)
      const isSubmitted = judgeScores.length > 0

      // Get all judges' scores for the contestant to calculate average
      const allJudgesScores = competitionScores.filter(
        score => score.contestant_id === contestant.id && !score.is_draft
      )
      
      // Group by criteria and calculate average per criteria
      const scoresByCriteria: Record<string, { sum: number, count: number }> = {}
      allJudgesScores.forEach(score => {
        if (!scoresByCriteria[score.criteria_id]) {
          scoresByCriteria[score.criteria_id] = { sum: 0, count: 0 }
        }
        scoresByCriteria[score.criteria_id].sum += score.score
        scoresByCriteria[score.criteria_id].count++
      })

      // Calculate average score
      let averageScore = 0
      Object.values(scoresByCriteria).forEach(({ sum, count }) => {
        averageScore += sum / count
      })

      return {
        id: contestant.id,
        contestant_name: contestant.contestant_name,
        registration_number: contestant.registration_number,
        judge_score: judgeScore,
        average_score: averageScore,
        max_possible: maxPossible,
        criteria_count: criteria.length,
        is_submitted: isSubmitted
      }
    })

    return result
  },

  // Updated getContestantCriteriaScores
  async getContestantCriteriaScores(judgeId: string, competitionId: string, contestantId: string): Promise<CriteriaScore[]> {
    // First get the judge record from profile ID
    const { data: judge, error: judgeError } = await supabase
      .from('judges')
      .select('id')
      .eq('profile_id', judgeId)
      .single()

    if (judgeError) throw judgeError

    // Verify the contestant belongs to the competition
    const { data: contestant, error: contestantError } = await supabase
      .from('contestants')
      .select('competition_id')
      .eq('id', contestantId)
      .single()

    if (contestantError) throw contestantError
    if (contestant.competition_id !== competitionId) {
      throw new Error("Contestant not in specified competition")
    }

    // Get all criteria for the competition
    const { data: criteria, error: criteriaError } = await supabase
      .from('judging_criteria')
      .select('id, name, max_points')
      .eq('competition_id', competitionId)

    if (criteriaError) throw criteriaError

    // Get all scores for this contestant (no need to filter by competition since we verified contestant)
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select('judge_id, criteria_id, score')
      .eq('contestant_id', contestantId)
      .eq('is_draft', false)

    if (scoresError) throw scoresError

    // Process data to calculate judge scores and averages per criteria
    const result = criteria.map(criterion => {
      // Get this judge's score for the criteria
      const judgeScore = allScores.find(
        score => score.judge_id === judge.id && score.criteria_id === criterion.id
      )?.score || 0

      // Get all judges' scores for this criteria to calculate average
      const criteriaScores = allScores.filter(
        score => score.criteria_id === criterion.id
      )
      
      const averageScore = criteriaScores.length > 0 
        ? criteriaScores.reduce((sum, score) => sum + score.score, 0) / criteriaScores.length
        : 0

      return {
        criteria_id: criterion.id,
        criteria_name: criterion.name,
        max_points: criterion.max_points,
        judge_score: judgeScore,
        average_score: averageScore
      }
    })

    return result
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
    try {
      // First get all judges with their profile info
      const { data: judges, error: judgesError } = await supabase
        .from('judges')
        .select(`
          id,
          profiles:profile_id(full_name),
          judge_assignments(
            id
          ),
          scores(
            score
          )
        `);

      if (judgesError) throw judgesError;

      return judges?.map(judge => {
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
          name: judge.profiles?.full_name || `Judge ${judge.id.slice(0, 6)}`,
          assigned_competitions: judge.judge_assignments?.length || 0,
          completed_evaluations: scores.length,
          consistency_score: Math.round(consistency),
          average_time_per_evaluation: 0 // Default value since time_spent doesn't exist
        };
      }) || [];
    } catch (error) {
      console.error("Error in getJudgePerformance:", error);
      throw error;
    }
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

  async getJudgeStats(judgeId: string) {
    if (!judgeId) {
      return {
        assignedEvents: 0,
        judgingProgress: 0,
        pendingReviews: 0
      };
    }

    try {
      // First get the judge record from profile ID
      const { data: judge, error: judgeError } = await supabase
        .from("judges")
        .select("id")
        .eq("profile_id", judgeId)
        .single();

      if (judgeError) throw judgeError;

      // Get judge's assigned competitions with criteria count
      const { data: assignments, error: assignmentsError } = await supabase
        .from('judge_assignments')
        .select(`
          competition_id,
          competitions:competition_id (
            id,
            judging_criteria:judging_criteria(count),
            contestants:contestants(count)
          )
        `)
        .eq('judge_id', judge.id);

      if (assignmentsError) throw assignmentsError;

      // Get all scores for this judge
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('contestant_id, criteria_id')
        .eq('judge_id', judge.id);

      if (scoresError) throw scoresError;

      // Calculate total possible evaluations
      let totalPossibleEvaluations = 0;
      const evaluationsPerCompetition: Record<string, number> = {};

      assignments?.forEach(assignment => {
        const criteriaCount = assignment.competitions?.judging_criteria?.[0]?.count || 0;
        const contestantCount = assignment.competitions?.contestants?.[0]?.count || 0;
        const evaluationsForCompetition = criteriaCount * contestantCount;
        totalPossibleEvaluations += evaluationsForCompetition;
        evaluationsPerCompetition[assignment.competition_id] = evaluationsForCompetition;
      });

      // Calculate completed evaluations
      const completedEvaluations = scores?.length || 0;
      const assignedEvents = assignments?.length || 0;

      // Calculate pending reviews
      let pendingReviews = 0;
      if (assignments) {
        pendingReviews = totalPossibleEvaluations - completedEvaluations;
      }

      return {
        assignedEvents,
        judgingProgress: totalPossibleEvaluations > 0 
          ? Math.round((completedEvaluations / totalPossibleEvaluations) * 100)
          : 0,
        pendingReviews: Math.max(0, pendingReviews)
      };
    } catch (error) {
      console.error("Error in getJudgeStats:", error);
      throw error;
    }
  },

  async getContestantStats(contestantId: string) {
    if (!contestantId) {
      return {
        registeredEvents: 0,
        judgingStatus: "Pending",
        averageScore: "0"
      };
    }

    const { data: registrations, error: regError } = await supabase
      .from('contestants')
      .select('competition_id')
      .eq('id', contestantId);

    if (regError) {
      console.error("Error fetching contestant registrations:", regError);
      throw regError;
    }

    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('score')
      .eq('contestant_id', contestantId);

    if (scoresError) {
      console.error("Error fetching contestant scores:", scoresError);
      throw scoresError;
    }

    const averageScore = scores?.length 
      ? (scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length).toFixed(1)
      : "0";

    return {
      registeredEvents: registrations?.length || 0,
      judgingStatus: scores?.length ? 'Completed' : 'Pending',
      averageScore
    };
  },

  async getRecentActivity() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });
      // .limit(10);

    if (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }

    return data || [];
  }
};

export const adminApi = {
  
  async getCompetitionResults(competitionId: string): Promise<{
    judges: JudgeResult[],
    contestants: ContestantResult[],
    max_possible: number
  }> {
    // Get all judges assigned to this competition
    const { data: judgeAssignments, error: assignmentsError } = await supabase
      .from('judge_assignments')
      .select(`
        judge_id,
        judges:judge_id (
          id,
          profiles:profile_id (full_name)
        )
      `)
      .eq('competition_id', competitionId)

    if (assignmentsError) throw assignmentsError

    // Get all contestants for this competition
    const { data: contestants, error: contestantsError } = await supabase
      .from('contestants')
      .select('id, contestant_name, registration_number')
      .eq('competition_id', competitionId)

    if (contestantsError) throw contestantsError

    // Get all criteria for max possible score calculation
    const { data: criteria, error: criteriaError } = await supabase
      .from('judging_criteria')
      .select('id, max_points')
      .eq('competition_id', competitionId)

    if (criteriaError) throw criteriaError

    const maxPossible = criteria.reduce((sum, criterion) => sum + criterion.max_points, 0)

    // Get all scores for this competition
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select(`
        judge_id,
        contestant_id,
        criteria_id,
        score,
        is_draft,
        judging_criteria:criteria_id (max_points)
      `)
      .eq('is_draft', false)

    if (scoresError) throw scoresError

    // Process judge results
    const judgeResults: JudgeResult[] = judgeAssignments.map(assignment => {
      const judgeId = assignment.judge_id
      const judgeName = assignment.judges?.profiles?.full_name || `Judge ${judgeId.slice(0, 6)}`
      
      // Get this judge's scores
      const judgeScores = allScores.filter(score => score.judge_id === judgeId)
      
      // Calculate scores per contestant
      const scoresByContestant: Record<string, {
        score: number
        criteria_count: number
        max_possible: number
      }> = {}

      judgeScores.forEach(score => {
        if (!scoresByContestant[score.contestant_id]) {
          scoresByContestant[score.contestant_id] = {
            score: 0,
            criteria_count: 0,
            max_possible: 0
          }
        }
        scoresByContestant[score.contestant_id].score += score.score
        scoresByContestant[score.contestant_id].criteria_count += 1
        scoresByContestant[score.contestant_id].max_possible += score.judging_criteria?.max_points || 0
      })

      // Calculate average score for this judge
      const validScores = Object.values(scoresByContestant).filter(s => s.criteria_count > 0)
      const averageScore = validScores.length > 0 
        ? validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length
        : 0

      return {
        judge_id: judgeId,
        judge_name: judgeName,
        scores: scoresByContestant,
        average_score: averageScore
      }
    })

    const contestantResults: ContestantResult[] = contestants.map(contestant => {
      // Get all scores for this contestant
      const contestantScores = allScores.filter(score => score.contestant_id === contestant.id)
      
      // Calculate total score from all judges
      const totalScore = contestantScores.reduce((sum, score) => sum + score.score, 0)
      
      const judgeCount = new Set(contestantScores.map(score => score.judge_id)).size
      
      // Calculate actual average score (total / number of judges)
      const averageScore = judgeCount > 0 ? totalScore / judgeCount : 0

      return {
        id: contestant.id,
        name: contestant.contestant_name,
        registration_number: contestant.registration_number,
        average_score: averageScore
      }
    })

    return {
      judges: judgeResults,
      contestants: contestantResults,
      max_possible: maxPossible
    }
  },

  async getCriteriaWiseResults(competitionId: string): Promise<CriteriaWiseResult[]> {
    // Get all judges assigned to this competition
    const { data: judgeAssignments, error: assignmentsError } = await supabase
      .from('judge_assignments')
      .select(`
        judge_id,
        judges:judge_id (
          id,
          profiles:profile_id (full_name)
        )
      `)
      .eq('competition_id', competitionId)

    if (assignmentsError) throw assignmentsError

    // Get all criteria for this competition
    const { data: criteria, error: criteriaError } = await supabase
      .from('judging_criteria')
      .select('id, name, max_points')
      .eq('competition_id', competitionId)

    if (criteriaError) throw criteriaError

    // Get all scores for this competition
    const { data: allScores, error: scoresError } = await supabase
      .from('scores')
      .select(`
        judge_id,
        contestant_id,
        criteria_id,
        score,
        is_draft
      `)
      .eq('is_draft', false)

    if (scoresError) throw scoresError

    // Process data into criteria-wise structure
    return judgeAssignments.map(assignment => {
      const judgeId = assignment.judge_id
      const judgeName = assignment.judges?.profiles?.full_name || `Judge ${judgeId.slice(0, 6)}`

      // Initialize criteria structure
      const criteriaData: CriteriaWiseResult['criteria'] = {}
      criteria.forEach(criterion => {
        criteriaData[criterion.id] = {
          name: criterion.name,
          max_points: criterion.max_points,
          scores: {}
        }
      })

      // Populate with scores
      const judgeScores = allScores.filter(score => score.judge_id === judgeId)
      judgeScores.forEach(score => {
        if (criteriaData[score.criteria_id]) {
          criteriaData[score.criteria_id].scores[score.contestant_id] = score.score
        }
      })

      return {
        judge_id: judgeId,
        judge_name: judgeName,
        criteria: criteriaData
      }
    })
  }
}