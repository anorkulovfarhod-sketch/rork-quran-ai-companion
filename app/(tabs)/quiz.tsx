import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, CheckCircle, XCircle, RefreshCw, Trophy, Sparkles } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useMutation } from "@tanstack/react-query";
import { generateObject } from "@rork-ai/toolkit-sdk";
import { z } from "zod";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  surah: string;
};

type QuizState = "idle" | "loading" | "active" | "completed";

export default function QuizScreen() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? Colors.light : Colors.dark;
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      console.log("Starting quiz generation...");
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), 30000);
      });

      try {
        const resultPromise = generateObject({
          messages: [
            {
              role: "user",
              content: `Generate 5 multiple choice questions about Quran verses. Each question should test knowledge about a specific verse, its meaning, or context. 
            
            Format as JSON with this structure:
            {
              "questions": [
                {
                  "question": "question text",
                  "options": ["option1", "option2", "option3", "option4"],
                  "correctAnswer": 0,
                  "explanation": "detailed explanation with Surah and Ayah reference",
                  "surah": "Surah name and number"
                }
              ]
            }
            
            Make questions educational and diverse, covering different Surahs and themes.`,
            },
          ],
          schema: z.object({
            questions: z.array(
              z.object({
                question: z.string(),
                options: z.array(z.string()),
                correctAnswer: z.number(),
                explanation: z.string(),
                surah: z.string(),
              })
            ),
          }),
        });

        const result = await Promise.race([resultPromise, timeoutPromise]) as { questions: QuizQuestion[] };
        console.log("Quiz generated successfully:", result);
        return result.questions;
      } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Quiz data received:", data);
      setQuestions(data);
      setQuizState("active");
      setCurrentQuestionIndex(0);
      setScore(0);
      setAnsweredQuestions(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    },
    onError: (error) => {
      console.error("Quiz generation failed:", error);
      setQuizState("idle");
    },
  });

  const currentQuestion = useMemo(
    () => (questions.length > 0 ? questions[currentQuestionIndex] : null),
    [questions, currentQuestionIndex]
  );

  const handleStartQuiz = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setQuizState("loading");
    generateQuizMutation.mutate();
  };

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === currentQuestion?.correctAnswer) {
      setScore(score + 1);
    }
    setAnsweredQuestions(answeredQuestions + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizState("completed");
    }
  };

  const handleRestartQuiz = () => {
    setQuizState("idle");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(0);
  };

  if (quizState === "idle") {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
        <LinearGradient
          colors={theme === 'dark' ? ['#1a1a1a', '#2a2a2a'] : [colors.primary, colors.primaryDark]}
          style={[styles.headerGradient, theme === 'dark' && { shadowColor: '#b8a06e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 8 }]}
        >
          <View style={styles.heroPattern} />
          <BookOpen color={theme === 'dark' ? colors.headingGold : '#ffffff'} size={44} strokeWidth={1.5} />
          <Text style={[styles.headerArabic, { color: theme === 'dark' ? colors.headingGold : '#ffffff' }]}>اختبار المعرفة</Text>
          <Text style={[styles.headerTitle, { color: theme === 'dark' ? colors.headingGold : '#ffffff' }]}>Knowledge Quiz</Text>
          <Text style={[styles.headerSubtext, { color: 'rgba(255,255,255,0.8)' }]}>
            Test Your Understanding Of Quranic Teachings
          </Text>
        </LinearGradient>

        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
          <View style={styles.featuresContainer}>
            <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <Sparkles color={theme === 'dark' ? colors.headingGold : colors.accent} size={28} strokeWidth={1.5} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Freshly Generated</Text>
              <Text style={[styles.featureText, { color: colors.muted }]}>
                Unique Questions Every Session
              </Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <BookOpen color={theme === 'dark' ? colors.headingGold : colors.accent} size={28} strokeWidth={1.5} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Scholarly Explanations</Text>
              <Text style={[styles.featureText, { color: colors.muted }]}>
                Learn From Each Answer
              </Text>
            </View>
            <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
              <Trophy color={theme === 'dark' ? colors.headingGold : colors.accent} size={28} strokeWidth={1.5} />
              <Text style={[styles.featureTitle, { color: colors.text }]}>Your Learning Journey</Text>
              <Text style={[styles.featureText, { color: colors.muted }]}>
                Track Your Progress
              </Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.startButton, { shadowColor: colors.primary }]}
              onPress={handleStartQuiz}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={theme === 'dark' ? [colors.headingGold, colors.headingGold] : [colors.primary, colors.primaryDark]}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Begin Quiz</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    );
  }

  if (quizState === "loading" || generateQuizMutation.isPending) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        {!generateQuizMutation.isError && (
          <>
            <ActivityIndicator size="large" color={theme === 'dark' ? colors.headingGold : colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Generating Your Quiz...</Text>
          </>
        )}
        {generateQuizMutation.isError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Failed to Generate Quiz</Text>
            <Text style={styles.errorText}>
              {generateQuizMutation.error instanceof Error 
                ? generateQuizMutation.error.message 
                : "An error occurred. Please check your connection and try again."}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRestartQuiz}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (quizState === "completed") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, backgroundColor: colors.background }]}>
        <LinearGradient
          colors={theme === 'dark' ? ['#1a1a1a', '#2a2a2a'] : [colors.primary, colors.primaryDark]}
          style={[styles.resultHeader, theme === 'dark' && { shadowColor: '#b8a06e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 8 }]}
        >
          <Trophy color={theme === 'dark' ? colors.headingGold : '#ffffff'} size={56} strokeWidth={1.5} />
          <Text style={[styles.resultTitle, { color: theme === 'dark' ? colors.headingGold : '#ffffff' }]}>Completed</Text>
        </LinearGradient>

        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
          <View style={[styles.scoreCard, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
            <Text style={[styles.scoreNumber, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>{percentage}%</Text>
            <Text style={[styles.scoreLabel, { color: colors.muted }]}>Your Score</Text>
            <Text style={[styles.scoreDetail, { color: colors.text }]}>
              {score} of {questions.length} correct
            </Text>
          </View>

          <View style={[styles.resultMessage, { backgroundColor: colors.parchment }]}>
            <Text style={[styles.resultMessageText, { color: colors.text }]}>
              {percentage >= 80
                ? "Excellent mastery of Quranic knowledge"
                : percentage >= 60
                ? "Good foundation—continue learning"
                : "Every step deepens understanding"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.restartButton, { borderColor: theme === 'dark' ? colors.headingGold : colors.primary, backgroundColor: colors.card, shadowColor: colors.primary }]}
            onPress={handleRestartQuiz}
            activeOpacity={0.8}
          >
            <RefreshCw color={theme === 'dark' ? colors.headingGold : colors.primary} size={20} strokeWidth={2} />
            <Text style={[styles.restartButtonText, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>Start New Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              backgroundColor: theme === 'dark' ? colors.headingGold : colors.primary,
              shadowColor: theme === 'dark' ? colors.headingGold : colors.primary,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.quizContainer}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: colors.muted }]}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <Text style={[styles.surahText, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>{currentQuestion?.surah}</Text>
        </View>

        <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion?.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = showExplanation;

            let backgroundColor = colors.card;
            let borderColor = colors.border;

            if (showResult && isCorrect) {
              backgroundColor = theme === 'dark' ? '#1a3d2e' : '#d1fae5';
              borderColor = theme === 'dark' ? colors.headingGold : colors.primary;
            } else if (showResult && isSelected && !isCorrect) {
              backgroundColor = theme === 'dark' ? '#3d1a1a' : '#fee2e2';
              borderColor = '#ef4444';
            } else if (isSelected) {
              borderColor = theme === 'dark' ? colors.headingGold : colors.primary;
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor, borderColor },
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <Text style={[styles.optionLetter, { backgroundColor: theme === 'dark' ? colors.headingGold : colors.primary }]}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                {showResult && isCorrect && (
                  <CheckCircle color={theme === 'dark' ? colors.headingGold : colors.primary} size={24} />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle color="#ef4444" size={24} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <View style={[styles.explanationCard, { backgroundColor: colors.parchment, borderLeftColor: theme === 'dark' ? colors.headingGold : colors.accent }]}>
            <Text style={[styles.explanationTitle, { color: theme === 'dark' ? colors.headingGold : colors.primary }]}>Explanation</Text>
            <Text style={[styles.explanationText, { color: colors.text }]}>
              {currentQuestion?.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {showExplanation && (
        <View style={[styles.bottomButton, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.nextButton, { shadowColor: colors.primary }]}
            onPress={handleNextQuestion}
          >
            <LinearGradient
              colors={theme === 'dark' ? [colors.headingGold, colors.headingGold] : [colors.primary, colors.primaryDark]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "View Results"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingVertical: 52,
    paddingHorizontal: 28,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  heroPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: "transparent",
  },
  headerArabic: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 20,
    textAlign: "center",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerSubtext: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.92,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    padding: 28,
    paddingBottom: 40,
  },
  featuresContainer: {
    gap: 18,
    marginTop: 12,
  },
  featureCard: {
    padding: 28,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  featureText: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  startButton: {
    marginTop: 40,
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonGradient: {
    paddingVertical: 20,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  progressBar: {
    height: 4,
  },
  progressFill: {
    height: "100%",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  surahText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600" as const,
  },
  questionText: {
    fontSize: 21,
    fontWeight: "600" as const,
    lineHeight: 32,
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 36,
    fontWeight: "600" as const,
    fontSize: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  explanationCard: {
    marginTop: 28,
    padding: 24,
    borderRadius: 18,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  bottomButton: {
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  resultHeader: {
    paddingVertical: 64,
    paddingHorizontal: 28,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginTop: 20,
    letterSpacing: 1,
  },
  scoreCard: {
    padding: 48,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: "600" as const,
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 17,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  scoreDetail: {
    fontSize: 16,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  resultMessage: {
    padding: 24,
    borderRadius: 18,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resultMessageText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  restartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    marginTop: 32,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.4,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#dc2626",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#991b1b",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});
