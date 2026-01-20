import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { messages, customApiKey, model: selectedModel, authToken } = await request.json();

    // Check if the user provided an auth token
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required to use the AI assistant' },
        { status: 401 }
      );
    }

    // Check API key
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Add system message to guide the AI to focus on mood-related conversations
    const systemInstruction = `You are a helpful mood assistant that specializes in discussing emotions, mental health, and well-being. 
      Your goal is to help users reflect on their feelings, provide empathetic responses, and offer gentle suggestions 
      for improving their mood when appropriate. Keep responses concise, supportive, and focused on the user's emotional state.
      Never provide medical advice or diagnose conditions. If users express severe distress or suicidal thoughts, 
      encourage them to seek professional help.`;

    const model = genAI.getGenerativeModel({
      model: selectedModel || 'gemini-2.5-flash-lite',
      systemInstruction,
    });

    // Prepare chat history for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    // Call Gemini API
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const assistantMessage = response.text();

    // Return the response
    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
} 