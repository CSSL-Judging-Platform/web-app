export const mockData = {
  // Company Information
  company: {
    name: "Computer Society of Sri Lanka (CSSL)",
    shortName: "CSSL",
    website: "https://cssl.lk",
    email: "info@cssl.lk",
    phone: "+94 11 234 5678",
    address: "123 Galle Road, Colombo 03, Sri Lanka",
  },

  developer: {
    name: "Code Idol",
    website: "https://codeidol.lk",
    email: "hello@codeidol.lk",
  },

  // Demo Users
  users: {
    admin: {
      id: "admin-1",
      email: "admin@cssl.lk",
      password: "admin123",
      role: "admin",
      name: "Admin User",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    judge: {
      id: "judge-1",
      email: "judge@cssl.lk",
      password: "judge123",
      role: "judge",
      name: "Dr. Samantha Silva",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    contestant: {
      id: "contestant-1",
      email: "contestant@cssl.lk",
      password: "contestant123",
      role: "contestant",
      name: "Kasun Perera",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },

  // Big Events (Conferences/Summits)
  bigEvents: [
    {
      id: "big-1",
      name: "CSSL Annual Conference 2024",
      description: "The premier technology conference in Sri Lanka",
      start_date: "2024-03-15",
      end_date: "2024-03-17",
      location: "BMICH, Colombo",
      status: "active",
      created_at: "2024-01-15T00:00:00Z",
    },
    {
      id: "big-2",
      name: "Innovation Summit 2024",
      description: "Showcasing cutting-edge technology innovations",
      start_date: "2024-06-20",
      end_date: "2024-06-22",
      location: "Cinnamon Grand, Colombo",
      status: "planning",
      created_at: "2024-02-01T00:00:00Z",
    },
  ],

  // Competitions (Small Events)
  competitions: [
    {
      id: "comp-1",
      name: "Best Undergraduate Project",
      description: "Competition for the best final year projects",
      big_event_id: "big-1",
      status: "active",
      max_contestants: 50,
      registration_deadline: "2024-02-28",
      judging_start: "2024-03-15",
      judging_end: "2024-03-16",
      created_at: "2024-01-20T00:00:00Z",
    },
    {
      id: "comp-2",
      name: "Innovation Challenge",
      description: "Innovative solutions to real-world problems",
      big_event_id: "big-1",
      status: "active",
      max_contestants: 30,
      registration_deadline: "2024-02-25",
      judging_start: "2024-03-16",
      judging_end: "2024-03-17",
      created_at: "2024-01-22T00:00:00Z",
    },
    {
      id: "comp-3",
      name: "Research Presentation",
      description: "Academic research presentation competition",
      big_event_id: "big-2",
      status: "planning",
      max_contestants: 25,
      registration_deadline: "2024-05-30",
      judging_start: "2024-06-20",
      judging_end: "2024-06-21",
      created_at: "2024-02-05T00:00:00Z",
    },
  ],

  // Judges
  judges: [
    {
      id: "judge-1",
      name: "Dr. Samantha Silva",
      email: "judge@cssl.lk",
      expertise: "Software Engineering, AI",
      organization: "University of Colombo",
      phone: "+94 77 123 4567",
      created_at: "2024-01-10T00:00:00Z",
    },
    {
      id: "judge-2",
      name: "Prof. Rajesh Kumar",
      email: "rajesh@cssl.lk",
      expertise: "Data Science, Machine Learning",
      organization: "University of Moratuwa",
      phone: "+94 77 234 5678",
      created_at: "2024-01-12T00:00:00Z",
    },
    {
      id: "judge-3",
      name: "Dr. Priya Mendis",
      email: "priya@cssl.lk",
      expertise: "Cybersecurity, Networks",
      organization: "SLIIT",
      phone: "+94 77 345 6789",
      created_at: "2024-01-14T00:00:00Z",
    },
  ],

  // Contestants
  contestants: [
    {
      id: "cont-1",
      contestant_name: "Kasun Perera",
      contestant_email: "contestant@cssl.lk",
      registration_number: "REG001",
      competition_id: "comp-1",
      university: "University of Colombo",
      year: "4th Year",
      additional_info: {
        project_title: "AI-Powered Traffic Management System",
        project_description:
          "An intelligent system to optimize traffic flow in urban areas using machine learning algorithms.",
      },
      created_at: "2024-02-01T00:00:00Z",
    },
    {
      id: "cont-2",
      contestant_name: "Nimali Fernando",
      contestant_email: "nimali@student.lk",
      registration_number: "REG002",
      competition_id: "comp-1",
      university: "University of Moratuwa",
      year: "4th Year",
      additional_info: {
        project_title: "Smart Agriculture Monitoring",
        project_description: "IoT-based system for monitoring crop health and environmental conditions.",
      },
      created_at: "2024-02-02T00:00:00Z",
    },
    {
      id: "cont-3",
      contestant_name: "Tharindu Wickramasinghe",
      contestant_email: "tharindu@student.lk",
      registration_number: "REG003",
      competition_id: "comp-2",
      university: "SLIIT",
      year: "3rd Year",
      additional_info: {
        project_title: "Blockchain-based Voting System",
        project_description: "Secure and transparent voting system using blockchain technology.",
      },
      created_at: "2024-02-03T00:00:00Z",
    },
  ],

  // Judge Assignments
  judgeAssignments: [
    {
      id: "assign-1",
      judge_id: "judge-1",
      competition_id: "comp-1",
      assigned_at: "2024-02-10T00:00:00Z",
    },
    {
      id: "assign-2",
      judge_id: "judge-1",
      competition_id: "comp-2",
      assigned_at: "2024-02-10T00:00:00Z",
    },
    {
      id: "assign-3",
      judge_id: "judge-2",
      competition_id: "comp-1",
      assigned_at: "2024-02-11T00:00:00Z",
    },
  ],

  // Judging Criteria by Competition
  judgingCriteria: {
    "comp-1": [
      {
        id: "crit-1",
        name: "Technical Innovation",
        description: "Originality and technical complexity of the solution",
        max_points: 25,
        weight: 0.3,
      },
      {
        id: "crit-2",
        name: "Implementation Quality",
        description: "Code quality, architecture, and best practices",
        max_points: 20,
        weight: 0.25,
      },
      {
        id: "crit-3",
        name: "Problem Solving",
        description: "How well the solution addresses the identified problem",
        max_points: 20,
        weight: 0.25,
      },
      {
        id: "crit-4",
        name: "Presentation",
        description: "Clarity of presentation and communication skills",
        max_points: 15,
        weight: 0.2,
      },
    ],
    "comp-2": [
      {
        id: "crit-5",
        name: "Innovation Impact",
        description: "Potential impact and scalability of the innovation",
        max_points: 30,
        weight: 0.4,
      },
      {
        id: "crit-6",
        name: "Feasibility",
        description: "Technical and commercial feasibility of the solution",
        max_points: 25,
        weight: 0.3,
      },
      {
        id: "crit-7",
        name: "Market Potential",
        description: "Market opportunity and business viability",
        max_points: 20,
        weight: 0.2,
      },
      {
        id: "crit-8",
        name: "Team Collaboration",
        description: "Evidence of effective teamwork and collaboration",
        max_points: 15,
        weight: 0.1,
      },
    ],
  },

  // Analytics Data
  analytics: {
    recentActivity: [
      {
        id: "act-1",
        message: "New competition created",
        details: "Best Undergraduate Project in CSSL Annual Conference 2024",
        timestamp: "2h ago",
        color: "blue",
      },
      {
        id: "act-2",
        message: "Judge assigned",
        details: "Dr. Samantha Silva assigned to Innovation Challenge",
        timestamp: "4h ago",
        color: "green",
      },
      {
        id: "act-3",
        message: "Bulk upload completed",
        details: "25 contestants added to Research Presentation",
        timestamp: "6h ago",
        color: "orange",
      },
      {
        id: "act-4",
        message: "Judging completed",
        details: "All scores submitted for Best Undergraduate Project",
        timestamp: "1d ago",
        color: "purple",
      },
    ],

    monthlyStats: {
      events: [12, 15, 18, 22, 25, 28],
      judges: [45, 48, 52, 55, 58, 62],
      contestants: [234, 267, 289, 312, 345, 378],
    },

    overview: {
      totalCompetitions: 3,
      totalJudges: 3,
      totalContestants: 3,
      averageScore: 82.1,
    },

    competitionStats: [
      {
        competition_id: "comp-1",
        name: "Best Undergraduate Project",
        participants: 50,
        completed: 45,
        completion_rate: 90,
      },
      {
        competition_id: "comp-2",
        name: "Innovation Challenge",
        participants: 30,
        completed: 28,
        completion_rate: 93,
      },
      {
        competition_id: "comp-3",
        name: "Research Presentation",
        participants: 25,
        completed: 0,
        completion_rate: 0,
      },
    ],

    judgePerformance: [
      {
        judge_id: "judge-1",
        name: "Dr. Samantha Silva",
        completed_evaluations: 15,
        average_time_per_evaluation: 12,
        consistency_score: 92,
        assigned_competitions: 2,
      },
      {
        judge_id: "judge-2",
        name: "Prof. Rajesh Kumar",
        completed_evaluations: 10,
        average_time_per_evaluation: 15,
        consistency_score: 88,
        assigned_competitions: 1,
      },
      {
        judge_id: "judge-3",
        name: "Dr. Priya Mendis",
        completed_evaluations: 0,
        average_time_per_evaluation: 0,
        consistency_score: 0,
        assigned_competitions: 0,
      },
    ],

    monthlyTrends: [
      { month: "Jan", competitions: 2, participants: 70 },
      { month: "Feb", competitions: 3, participants: 85 },
      { month: "Mar", competitions: 4, participants: 95 },
      { month: "Apr", competitions: 5, participants: 110 },
      { month: "May", competitions: 5, participants: 120 },
      { month: "Jun", competitions: 6, participants: 135 },
    ],
  },

  // Judge Reports Data
  judgeReports: {
    "judge-1": {
      assignedEvents: 2,
      completedSubmissions: 15,
      totalContestants: 20,
      averageScore: 78.5,
      events: [
        {
          id: "comp-1",
          name: "Best Undergraduate Project",
          status: "active",
          contestants: 12,
          completed: 8,
          progress: 67,
        },
        {
          id: "comp-2",
          name: "Innovation Challenge",
          status: "active",
          contestants: 8,
          completed: 7,
          progress: 88,
        },
      ],
      recentScores: [
        {
          contestant: "Kasun Perera",
          competition: "Best Undergraduate Project",
          score: 85,
          date: "2024-03-10",
        },
        {
          contestant: "Nimali Fernando",
          competition: "Best Undergraduate Project",
          score: 92,
          date: "2024-03-09",
        },
      ],
    },
  },
}

// -----------------------------------------------------------------------------
// In-memory mock API – simulates minimal CRUD calls used by the UI components
// -----------------------------------------------------------------------------
/**
 * Very small helper to introduce a network-like delay
 */
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms))

/**
 * Basic REST-style mock API for local/demo mode.
 * Only the endpoints currently used in the project are implemented.
 */
const mockApi = {
  /**
   * GET helper – extend as needed
   */
  async get<T = unknown>(url: string): Promise<T> {
    await wait()
    if (url.startsWith("/competitions")) {
      // /competitions  OR  /competitions/:id
      if (url === "/competitions") return mockData.competitions as unknown as T
      const id = url.split("/")[2]
      return mockData.competitions.find((c) => c.id === id) as unknown as T
    }
    // fallback
    return {} as T
  },

  /**
   * POST helper – only /competitions is required right now
   */
  async post<T = unknown>(url: string, body: any): Promise<T> {
    await wait()
    if (url === "/competitions") {
      const newComp = {
        id: `comp-${Date.now()}`,
        contestants_count: 0,
        judges_count: 0,
        criteria_count: 0,
        ...body,
      }
      mockData.competitions.push(newComp)
      return newComp as unknown as T
    }
    return {} as T
  },

  /**
   * DELETE helper – only /competitions/:id is required right now
   */
  async delete<T = unknown>(url: string): Promise<T> {
    await wait()
    if (url.startsWith("/competitions/")) {
      const id = url.split("/")[2]
      mockData.competitions = mockData.competitions.filter((c) => c.id !== id)
      return { success: true } as unknown as T
    }
    return {} as T
  },
}

export { mockApi }
