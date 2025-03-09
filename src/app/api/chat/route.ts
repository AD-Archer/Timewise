import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Add system message to guide the AI to focus on mood-related conversations
    const systemMessage = {
      role: 'system',
      content: `You are a helpful mood assistant that specializes in discussing emotions, mental health, and well-being. 
      Your goal is to help users reflect on their feelings, provide empathetic responses, and offer gentle suggestions 
      for improving their mood when appropriate. Keep responses concise, supportive, and focused on the user's emotional state.
      Never provide medical advice or diagnose conditions. If users express severe distress or suicidal thoughts, 
      encourage them to seek professional help.`
    };

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 300,
    });

    // Extract the assistant's message
    const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I couldn\'t process that.';

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