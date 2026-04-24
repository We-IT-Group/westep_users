import apiClient from '../apiClient';

export interface BackendQuestion {
  sessionQuestionId: string;
  questionId: string;
  orderIndex: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: string | null;
  correctOption?: string; // Only in results
  correct?: boolean; // Only in results
}

export interface SessionResponse {
  sessionId: string;
  moduleId: string;
  moduleName: string;
  questionCount: number;
  durationMinutes: number;
  startedAt: string;
  endsAt: string;
  finishedAt: string | null;
  status: 'IN_PROGRESS' | 'FINISHED';
  remainingSeconds: number;
  questions: BackendQuestion[];
}

export interface SubmitResponse {
  sessionId: string;
  moduleId: string;
  moduleName: string;
  status: 'FINISHED';
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  durationMinutes: number;
  spentSeconds: number;
  startedAt: string;
  endsAt: string;
  finishedAt: string;
  incorrectAnswers: {
    questionId: string;
    selectedOption: string;
    correctOption: string;
  }[];
}

export interface SessionSummary {
  sessionId: string;
  moduleId: string;
  moduleName: string;
  status: 'FINISHED' | 'IN_PROGRESS';
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  durationMinutes: number;
  spentSeconds: number;
  startedAt: string;
  endsAt: string;
  finishedAt: string;
}

export interface SessionDetail {
  summary: SessionSummary;
  questions: BackendQuestion[];
}

export const testApi = {
  // Start a new test session
  startSession: async (moduleId: string): Promise<SessionResponse> => {
    const response = await apiClient.post(`/module-tests/module/${moduleId}/start`);
    return response.data;
  },

  // Get current state of an existing session (recovery)
  getSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await apiClient.get(`/module-tests/sessions/${sessionId}`);
    return response.data;
  },

  // Submit test and finish session
  finishSession: async (sessionId: string, answers: { questionId: string; selectedOption: string }[]): Promise<SubmitResponse> => {
    const response = await apiClient.post(`/module-tests/sessions/${sessionId}/finish`, { answers });
    return response.data;
  },

  // Get user's test history
  getMyResults: async (): Promise<SessionSummary[]> => {
    const response = await apiClient.get('/module-tests/my-results');
    return response.data;
  },

  // Get test history filtered by course
  getMyResultsByCourse: async (courseId: string): Promise<SessionSummary[]> => {
    const response = await apiClient.get(`/module-tests/my-results/course/${courseId}`);
    return response.data;
  },

  // Get details of a specific past session
  getResultDetail: async (sessionId: string): Promise<SessionDetail> => {
    const response = await apiClient.get(`/module-tests/my-results/${sessionId}`);
    return response.data;
  }
};
