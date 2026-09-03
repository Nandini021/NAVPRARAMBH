# record-game-session

Authenticated Edge Function for recording a completed game.

The browser sends only `gameId`, `correctAnswers`, and `totalQuestions`.
The function validates the user and game, derives the score, calculates XP and
coins from the trusted `games.xp_reward`, writes the session, updates
`career_scores.xp`, and awards eligible badges with compensating cleanup if a
later write fails.

No service or secret key is included in frontend code.
