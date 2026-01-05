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
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.heroPattern} />
          <BookOpen color={Colors.light.secondary} size={44} strokeWidth={1.5} />
          <Text style={styles.headerArabic}>اختبار المعرفة</Text>
          <Text style={styles.headerTitle}>Knowledge Quiz</Text>
          <Text style={styles.headerSubtext}>
            Test Your Understanding Of Quranic Teachings
          </Text>
        </LinearGradient>

        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Sparkles color={Colors.light.accent} size={28} strokeWidth={1.5} />
              <Text style={styles.featureTitle}>Freshly Generated</Text>
              <Text style={styles.featureText}>
                Unique Questions Every Session
              </Text>
            </View>
            <View style={styles.featureCard}>
              <BookOpen color={Colors.light.accent} size={28} strokeWidth={1.5} />
              <Text style={styles.featureTitle}>Scholarly Explanations</Text>
              <Text style={styles.featureText}>
                Learn From Each Answer
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Trophy color={Colors.light.accent} size={28} strokeWidth={1.5} />
              <Text style={styles.featureTitle}>Your Learning Journey</Text>
              <Text style={styles.featureText}>
                Track Your Progress
              </Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartQuiz}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryDark]}
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
      <View style={styles.loadingContainer}>
        {!generateQuizMutation.isError && (
          <>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Generating Your Quiz...</Text>
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
              style={styles.retryButton}
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
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.resultHeader}
        >
          <Trophy color={Colors.light.secondary} size={56} strokeWidth={1.5} />
          <Text style={styles.resultTitle}>Completed</Text>
        </LinearGradient>

        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentInner}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreNumber}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Your Score</Text>
            <Text style={styles.scoreDetail}>
              {score} of {questions.length} correct
            </Text>
          </View>

          <View style={styles.resultMessage}>
            <Text style={styles.resultMessageText}>
              {percentage >= 80
                ? "Excellent mastery of Quranic knowledge"
                : percentage >= 60
                ? "Good foundation—continue learning"
                : "Every step deepens understanding"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRestartQuiz}
            activeOpacity={0.8}
          >
            <RefreshCw color={Colors.light.primary} size={20} strokeWidth={2} />
            <Text style={styles.restartButtonText}>Start New Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.quizContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <Text style={styles.surahText}>{currentQuestion?.surah}</Text>
        </View>

        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = showExplanation;

            let backgroundColor = Colors.light.card;
            let borderColor = Colors.light.border;

            if (showResult && isCorrect) {
              backgroundColor = "#d1fae5";
              borderColor = Colors.light.primary;
            } else if (showResult && isSelected && !isCorrect) {
              backgroundColor = "#fee2e2";
              borderColor = "#ef4444";
            } else if (isSelected) {
              borderColor = Colors.light.primary;
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
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={styles.optionText}>{option}</Text>
                {showResult && isCorrect && (
                  <CheckCircle color={Colors.light.primary} size={24} />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle color="#ef4444" size={24} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>
              {currentQuestion?.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {showExplanation && (
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
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
    backgroundColor: Colors.light.background,
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
    backgroundColor: Colors.light.card,
    padding: 28,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    letterSpacing: 0.3,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.muted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  startButton: {
    marginTop: 40,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Colors.light.primary,
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
    backgroundColor: Colors.light.background,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.muted,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
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
    color: Colors.light.muted,
    fontWeight: "600" as const,
  },
  surahText: {
    fontSize: 12,
    color: Colors.light.primary,
    marginTop: 4,
    fontWeight: "600" as const,
  },
  questionText: {
    fontSize: 21,
    fontWeight: "600" as const,
    color: Colors.light.text,
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
    backgroundColor: Colors.light.primary,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 36,
    fontWeight: "600" as const,
    fontSize: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  explanationCard: {
    marginTop: 28,
    padding: 24,
    backgroundColor: Colors.light.parchment,
    borderRadius: 18,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginBottom: 10,
    letterSpacing: 0.4,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  bottomButton: {
    padding: 20,
    backgroundColor: Colors.light.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.light.primary,
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
    backgroundColor: Colors.light.card,
    padding: 48,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 17,
    color: Colors.light.muted,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  scoreDetail: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  resultMessage: {
    backgroundColor: Colors.light.parchment,
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
    color: Colors.light.text,
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
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.card,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
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
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});
