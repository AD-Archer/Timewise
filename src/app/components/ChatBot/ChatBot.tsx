'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowDown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const { settings, chatHistory, addChatMessage, clearChatHistory, exportChatHistory } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! I\'m your mood assistant. How are you feeling today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Simple function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check scroll position to show/hide scroll button
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 20;
    setShowScrollButton(isScrolledUp);
  };

  // Load chat history if available
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0 && user) {
      const loadedMessages = chatHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }));
      
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }
    }
  }, [chatHistory, user]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Check if user is authenticated
    if (!user) {
      setAuthError('Please sign in to use the AI assistant');
      return;
    }
    
    setAuthError(null);
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Check if scroll button should be shown after adding message
    setTimeout(() => handleScroll(), 100);

    try {
      // Get the auth token
      const authToken = await user.getIdToken();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          customApiKey: settings.customOpenAIKey,
          authToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      // Save chat message to memory if chat export is enabled
      if (settings.chatExportEnabled) {
        // Add messages to chat history
        addChatMessage({
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp.getTime()
        });
        
        addChatMessage({
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp.getTime()
        });
      }
      
      // Check if scroll button should be shown after receiving response
      setTimeout(() => handleScroll(), 100);
    } catch (error: Error | unknown) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Sorry, I had trouble processing that. Please try again.',
          timestamp: new Date(),
        },
      ]);
      
      // Check if scroll button should be shown after error message
      setTimeout(() => handleScroll(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="w-full flex flex-col bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/10 h-[700px]">
        <div className="h-[60px] flex-none p-3 bg-pink-600/80 text-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot size={18} />
            Mood Assistant
          </h2>
          <p className="text-xs text-white/70">Talk to me about how you&apos;re feeling today</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-white/10 max-w-md">
            <div className="mb-4 text-pink-500">
              <Lock size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
            <p className="text-gray-300 mb-6">
              Please sign in to use the AI assistant. This helps us prevent abuse and ensures the service remains available for everyone.
            </p>
            <button
              onClick={() => {
                // Dispatch a custom event to open the auth modal
                window.dispatchEvent(new CustomEvent('openAuthModal'));
              }}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-black/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/10 h-[700px]">
      {/* Header - Fixed height */}
      <div className="h-[60px] flex-none p-3 bg-pink-600/80 text-white">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot size={18} />
          Mood Assistant
        </h2>
        <p className="text-xs text-white/70">Talk to me about how you&apos;re feeling today</p>
      </div>
      
      {/* Messages Container - Takes remaining space with scrolling */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 relative"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-pink-600 text-white rounded-tr-none'
                  : 'bg-white/10 text-white rounded-tl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.role === 'assistant' ? (
                  <Bot size={16} className="text-pink-300" />
                ) : (
                  <User size={16} className="text-white" />
                )}
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-white/10 text-white rounded-tl-none">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-pink-300" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {authError && (
          <div className="flex justify-center">
            <div className="max-w-[80%] p-3 rounded-lg bg-red-900/50 text-white border border-red-700">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={16} className="text-red-300" />
                <span className="text-xs opacity-70">Authentication Error</span>
              </div>
              <p className="whitespace-pre-wrap">{authError}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 right-2 p-2 rounded-full bg-pink-600 text-white shadow-lg hover:bg-pink-700 transition-colors"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={18} />
          </button>
        )}
      </div>
      
      {/* Input Area - Fixed height at bottom */}
      <div className="h-[50px] flex-none p-2 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2 h-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 text-white rounded-lg p-2 outline-none resize-none h-full"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`flex-none p-2 rounded-full ${
              isLoading || !input.trim()
                ? 'bg-pink-600/50 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700'
            } text-white transition-colors`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 