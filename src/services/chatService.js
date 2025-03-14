import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ASSESSMENT_QUESTIONS, analyzeResponse, determineMentalHealthStage, MENTAL_HEALTH_STAGES } from '../models/mentalHealthModel';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = 'AIzaSyAmKaUfoXSodEwIKaSN4xWHuv6azit0LRI';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

class ChatService {
  constructor(userId) {
    this.userId = userId;
    this.currentQuestionIndex = 0;
    this.scores = {};
    this.conversationHistory = [];
    this.genAI = genAI;
    this.chat = null;
    this.sessionId = null;
  }

  async initSession() {
    try {
      const sessionId = `${this.userId}_${Date.now()}`;
      const sessionRef = doc(db, 'chatSessions', sessionId);
      
      await setDoc(sessionRef, {
        userId: this.userId,
        startTime: new Date(),
        status: 'active',
        mentalHealthScores: {}
      });

      this.sessionId = sessionId;
      
      const firstMessageRef = doc(collection(db, `chatSessions/${sessionId}/messages`));
      await setDoc(firstMessageRef, {
        timestamp: new Date(),
        content: "Session initialized",
        type: "system"
      });

      return this.getNextQuestion();
    } catch (error) {
      console.error('Error initializing chat session:', error);
      throw error;
    }
  }

  async processUserMessage(userMessage) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Create context with specific instructions for clinical assessment
      let context = `You are an AI mental health assistant conducting a clinical assessment. Your role is to:

1. Engage in empathetic conversation while assessing mental health indicators
2. Ask relevant follow-up questions to gather more information
3. Analyze responses for signs of:
   - Depression (mild, moderate, severe)
   - Anxiety (general, social, panic disorder)
   - Suicidal thoughts or tendencies
   - Stress (acute, chronic)
   - Bipolar disorder
   - Personality disorders
   - PTSD
   - OCD
   - Eating disorders
   - Addiction tendencies
   - Anger management issues
   - Grief/Loss
   - Sleep disorders
   - Social isolation
   - Self-esteem issues
   - Relationship problems

4. Format your response as JSON:
{
  "response": "your empathetic response and follow-up question",
  "assessment": {
    "primaryCondition": "identified primary condition",
    "secondaryConditions": ["other observed conditions"],
    "severity": "mild/moderate/severe",
    "confidence": 0.1-1.0,
    "riskLevel": "low/medium/high",
    "keyIndicators": ["observed symptoms/behaviors"],
    "recommendedAction": "immediate help/professional consultation/self-care"
  }
}

Previous conversation:
${this.conversationHistory.map(msg => `User: ${msg.user}\nAssistant: ${msg.bot.response || msg.bot}\n`).join('\n')}

User: ${userMessage}

Remember:
- Maintain a supportive, non-judgmental tone
- Flag any concerning patterns, especially related to self-harm
- Include crisis resources for high-risk situations
- Emphasize that this is an AI assessment and recommend professional evaluation`;

      // Generate response
      const result = await model.generateContent(context);
      const response = await result.response;
      const responseText = response.text();

      try {
        // Clean and validate the response text
        let cleanResponseText = responseText.trim();
        
        // Extract JSON content from markdown code blocks if present
        const jsonMatch = cleanResponseText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
        if (jsonMatch) {
          cleanResponseText = jsonMatch[1];
        }
        
        // Basic JSON structure validation
        if (!cleanResponseText || typeof cleanResponseText !== 'string') {
          throw new Error('Empty or invalid response');
        }
        
        // Find the first occurrence of { and last occurrence of }
        const startIdx = cleanResponseText.indexOf('{');
        const endIdx = cleanResponseText.lastIndexOf('}');
        
        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
          throw new Error('No valid JSON object found in response');
        }
        
        // Extract what appears to be the JSON object
        cleanResponseText = cleanResponseText.slice(startIdx, endIdx + 1);
        
        // Log the final cleaned text before parsing
        console.log('Attempting to parse JSON:', cleanResponseText);
        
        const parsedResponse = JSON.parse(cleanResponseText);
        console.log('Successfully parsed response:', parsedResponse);
        
        // Validate required fields
        if (!parsedResponse.response || !parsedResponse.assessment) {
          throw new Error('Missing required fields in response');
        }
        
        // Update conversation history
        this.conversationHistory.push({
          user: userMessage,
          bot: parsedResponse
        });

        if (this.conversationHistory.length > 5) {
          this.conversationHistory = this.conversationHistory.slice(-5);
        }

        // Store in Firebase
        await updateDoc(doc(db, 'users', this.userId), {
          currentMentalState: {
            date: new Date(),
            stage: parsedResponse.assessment.primaryCondition,
            severity: parsedResponse.assessment.severity,
            confidence: parsedResponse.assessment.confidence,
            riskLevel: parsedResponse.assessment.riskLevel,
            keyIndicators: parsedResponse.assessment.keyIndicators,
            recommendedAction: parsedResponse.assessment.recommendedAction,
            secondaryConditions: parsedResponse.assessment.secondaryConditions,
            lastUpdate: new Date()
          }
        });

        return {
          response: parsedResponse.response,
          mentalHealthStage: {
            primaryStage: parsedResponse.assessment.primaryCondition,
            severity: parsedResponse.assessment.severity,
            confidence: parsedResponse.assessment.confidence,
            riskLevel: parsedResponse.assessment.riskLevel,
            indicators: parsedResponse.assessment.keyIndicators,
            recommendedAction: parsedResponse.assessment.recommendedAction
          }
        };

      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response:', responseText);
        
        // Return a more informative fallback response
        let fallbackResponse = "I apologize for the technical difficulty. To better assist you, could you elaborate on your current thoughts and feelings? This helps me provide more accurate support.";
        
        // Return a structured fallback object
        return {
          response: fallbackResponse,
          mentalHealthStage: {
            primaryStage: 'Assessment Needed',
            severity: 'undetermined',
            confidence: 0.3,
            riskLevel: 'pending evaluation',
            indicators: ['technical error - assessment interrupted'],
            recommendedAction: 'restart conversation if issues persist'
          }
        };
      }

    } catch (error) {
      console.error('Error in processUserMessage:', error);
      throw error;
    }
  }

  getNextQuestion() {
    if (this.currentQuestionIndex >= ASSESSMENT_QUESTIONS.length) {
      return null;
    }
    const question = ASSESSMENT_QUESTIONS[this.currentQuestionIndex];
    return question.questions[Math.floor(Math.random() * question.questions.length)];
  }

  async completeAssessment(mentalHealthStage) {
    try {
      await updateDoc(doc(db, 'chatSessions', this.sessionId), {
        status: 'completed',
        endTime: new Date(),
        mentalHealthStage: mentalHealthStage
      });

      await updateDoc(doc(db, 'users', this.userId), {
        lastAssessment: {
          date: new Date(),
          stage: mentalHealthStage
        }
      });
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw error;
    }
  }
}

export default ChatService;
