interface GameCompletionData {
  username: string;
  time: number; // Time in seconds from stopwatch
  correct: number;
  wrong: number;
  gameType: 'math' | 'word' | 'quiz' | 'speed';
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class GameStatsService {
  private readonly API_ENDPOINT = 'https://sports.ue-varna.bg/api.php';

  /**
   * Sends game completion data to the remote API
   */
  async submitGameStats(data: GameCompletionData): Promise<ApiResponse> {
    try {
      console.log('Submitting game stats:', data);

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          time: data.time,
          correct: data.correct,
          wrong: data.wrong,
          gameType: data.gameType,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Game stats submitted successfully:', result);
      
      return {
        success: true,
        message: result.message || 'Game stats submitted successfully',
      };
    } catch (error) {
      console.error('Failed to submit game stats:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Helper method for Math game completion
   */
  async submitMathGameStats(params: {
    correctAnswers: number;
    totalProblems: number;
    timeElapsed: number;
  }): Promise<ApiResponse> {
    const username = localStorage.getItem('currentPlayerName') || 'Anonymous';
    
    return this.submitGameStats({
      username,
      time: params.timeElapsed,
      correct: params.correctAnswers,
      wrong: params.totalProblems - params.correctAnswers,
      gameType: 'math',
    });
  }

  /**
   * Helper method for Word game completion
   */
  async submitWordGameStats(params: {
    correctAnswers: number;
    totalAttempts: number;
    timeElapsed: number;
  }): Promise<ApiResponse> {
    const username = localStorage.getItem('currentPlayerName') || 'Anonymous';
    
    return this.submitGameStats({
      username,
      time: params.timeElapsed,
      correct: params.correctAnswers,
      wrong: params.totalAttempts - params.correctAnswers,
      gameType: 'word',
    });
  }

  /**
   * Helper method for Quiz game completion
   */
  async submitQuizGameStats(params: {
    score: number;
    totalAttempts: number;
    timeElapsed: number;
  }): Promise<ApiResponse> {
    const username = localStorage.getItem('currentPlayerName') || 'Anonymous';
    
    return this.submitGameStats({
      username,
      time: params.timeElapsed,
      correct: params.score,
      wrong: params.totalAttempts - params.score,
      gameType: 'quiz',
    });
  }

  /**
   * Helper method for Speed game completion
   */
  async submitSpeedGameStats(params: {
    correctAnswers: number;
    wrongAnswers: number;
    timeElapsed: number;
  }): Promise<ApiResponse> {
    const username = localStorage.getItem('currentPlayerName') || 'Anonymous';
    
    return this.submitGameStats({
      username,
      time: params.timeElapsed,
      correct: params.correctAnswers,
      wrong: params.wrongAnswers,
      gameType: 'speed',
    });
  }

  /**
   * Checks if the current game is in single-player mode (not competitive)
   */
  isSinglePlayerMode(currentTeam?: any): boolean {
    return !currentTeam;
  }
}

// Export singleton instance
export const gameStatsService = new GameStatsService();

// Export types for use in game components
export type { GameCompletionData, ApiResponse }; 