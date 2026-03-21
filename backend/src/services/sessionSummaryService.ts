import Question from "../models/Question";

export const generateSessionSummary = async (sessionId: string) => {
  // 1. Get all questions of session
  const questions = await Question.find({ session: sessionId });

  const totalQuestions = questions.length;

  // 2. Calculate session duration (based on questions time)
  let duration = 0;

  if (questions.length > 0) {
    const firstTime = questions[0].createdAt;
    const lastTime = questions[questions.length - 1].createdAt;

    duration =
      (new Date(lastTime).getTime() - new Date(firstTime).getTime()) /
      (1000 * 60); // minutes
  }

  // 3. Simple mood detection (we will improve later if needed)
  const text = questions
    .map((q) => q.content)
    .join(" ")
    .toLowerCase();

  let mood = "Neutral participation";

  const confusedKeywords = ["confused", "not understand", "doubt", "unclear"];
  const engagedKeywords = ["thanks", "got it", "understood", "clear", "nice"];

  let confusedCount = 0;
  let engagedCount = 0;

  confusedKeywords.forEach((word) => {
    if (text.includes(word)) confusedCount++;
  });

  engagedKeywords.forEach((word) => {
    if (text.includes(word)) engagedCount++;
  });

  if (confusedCount > engagedCount) {
    mood = "Students seem confused and need clarification";
  } else if (engagedCount > confusedCount) {
    mood = "Students are engaged and understanding well";
  } else if (totalQuestions === 0) {
    mood = "No participation in this session";
  }

  return {
    totalQuestions,
    duration: Math.round(duration),
    mood,
  };
};
