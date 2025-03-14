import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/chatService';

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const scrollViewRef = useRef();
  const chatServiceRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        const chatService = new ChatService(user.uid);
        await chatService.initSession();
        chatServiceRef.current = chatService;
        
        // Add initial messages
        setMessages([
          {
            id: Date.now(),
            text: "Hi! I'm your AI health assistant. I'm here to chat and understand how you're feeling. Everything you share with me is confidential.",
            isUser: false
          }
        ]);
      } catch (error) {
        console.error('Error initializing chat:', error);
        // Show error message to user
        setMessages([
          {
            id: Date.now(),
            text: "I apologize, but I'm having trouble connecting. Please try again later or contact support if the problem persists.",
            isUser: false
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.uid) {
      initChat();
    }
  }, [user?.uid]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // Add user message to UI
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: userMessage,
        isUser: true
      }]);

      // Process message through chat service
      const response = await chatServiceRef.current.processUserMessage(userMessage);

      // Add AI response to UI
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: response.response,
        isUser: false
      }]);

      // Update assessment if mental health stage has changed
      if (response.mentalHealthStage) {
        setAssessment({
          primaryStage: response.mentalHealthStage.primaryStage,
          confidence: response.mentalHealthStage.confidence,
          analysis: response.analysis
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, but I'm having trouble processing your message. Could you try again?",
        isUser: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#5352ed" />
            </View>
          )}
          {assessment && (
            <View style={styles.assessmentContainer}>
              <Text style={styles.assessmentTitle}>Assessment Complete</Text>
              <Text style={styles.assessmentText}>
                Based on our conversation, I've noticed some indicators of {assessment.primaryStage.toLowerCase()} 
                {assessment.confidence > 0.7 ? ' with high confidence' : assessment.confidence > 0.4 ? ' with moderate confidence' : ' with low confidence'}.
              </Text>
              <Text style={styles.assessmentNote}>
                Remember, this is not a clinical diagnosis. If you're concerned about your mental health, 
                please consult with a mental health professional.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Icon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 8,
    padding: 12,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#5352ed',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#3a3a3a',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#2d2d2d',
  },
  input: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5352ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  assessmentContainer: {
    backgroundColor: '#3a3a3a',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },
  assessmentTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assessmentText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  assessmentNote: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
