interface GameCompletionData {
  username: string;
  time: string; // Time in "MM:SS" format
  timeSeconds: number; // Time in seconds for calculations
  correct: number;
  wrong: number;
  gameType: 'math' | 'word' | 'quiz' | 'speed' | 'memory' | 'logic';
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class GameStatsService {
  private readonly API_ENDPOINT = 'http://localhost:3001/api/game-stats';

  /**
   * Converts seconds to MM:SS format
   */
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Sends game completion data to the remote API
   */
  async submitGameStats(data: GameCompletionData): Promise<ApiResponse> {
    try {

      const requestBody = {
        username: data.username,
        time: data.time,
        timeSeconds: data.timeSeconds,
        correct: data.correct,
        wrong: data.wrong,
        gameType: data.gameType,
      };

      // console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      // console.log('✅ Server response:', result);
      console.log('🎉 Game stats submitted successfully!');
      
      return {
        success: true,
        message: result.message || 'Game stats submitted successfully',
      };
    } catch (error) {
      // console.error('❌ Failed to submit game stats:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // console.error('🔌 Network error - make sure the dummy server is running on localhost:3001');
        // console.error('💡 Start server: cd game-stats-server && npm start');
      }
      
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
      time: this.formatTime(params.timeElapsed),
      timeSeconds: params.timeElapsed,
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
      time: this.formatTime(params.timeElapsed),
      timeSeconds: params.timeElapsed,
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
      time: this.formatTime(params.timeElapsed),
      timeSeconds: params.timeElapsed,
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
      time: this.formatTime(params.timeElapsed),
      timeSeconds: params.timeElapsed,
      correct: params.correctAnswers,
      wrong: params.wrongAnswers,
      gameType: 'speed',
    });
  }

  /**
   * Helper method for Memory game completion
   */
  async submitMemoryGameStats(params: {
    movesUsed: number;
    maxMoves: number;
    timeElapsed: number;
    completed: boolean;
  }): Promise<ApiResponse> {
    const username = localStorage.getItem('currentPlayerName') || 'Anonymous';
    
    return this.submitGameStats({
      username,
      time: this.formatTime(params.timeElapsed),
      timeSeconds: params.timeElapsed,
      correct: params.completed ? 1 : 0,
      wrong: params.completed ? 0 : 1,
      gameType: 'memory',
    });
  }

  /**
   * Helper method for Logic game completion
   */
  async submitLogicGameStats(params: {
    movesUsed: number;
    timeElapsed: number;
    completed: boolean;
  }): Promise<ApiResponse> {
    const username = localStorage.getItem('currentPlayerName') || 'Anonymous';
    
    return this.submitGameStats({
      username,
      time: this.formatTime(params.timeElapsed),
      timeSeconds: params.timeElapsed,
      correct: params.completed ? 1 : 0,
      wrong: params.completed ? 0 : 1,
      gameType: 'logic',
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