import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../cors-config.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
  }

  // Only allow GET and POST
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    if (req.method === 'GET') {
      // Get chat history or available chats
      const { userId, limit = 50 } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        console.error('Error fetching chats:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch chat history'
        });
      }

      return res.status(200).json({
        success: true,
        data: chats
      });

    } else if (req.method === 'POST') {
      // Send message or create new chat
      const { userId, message, sessionId } = req.body;

      if (!userId || !message) {
        return res.status(400).json({
          success: false,
          error: 'userId and message are required'
        });
      }

      // For now, just store the message. In a real implementation,
      // you would integrate with an AI service like OpenAI
      const { data: chatMessage, error } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          session_id: sessionId || `session_${Date.now()}`,
          message: message,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving chat message:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to save message'
        });
      }

      // Mock AI response for now
      const aiResponse = {
        message: "Olá! Sou o assistente da Saraiva Vision. Como posso ajudar você hoje com questões sobre saúde ocular?",
        role: 'assistant'
      };

      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          session_id: sessionId || chatMessage.session_id,
          message: aiResponse.message,
          role: aiResponse.role,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (aiError) {
        console.error('Error saving AI response:', error);
      }

      return res.status(200).json({
        success: true,
        data: {
          userMessage: chatMessage,
          aiResponse: aiMessage || aiResponse
        }
      });
    }

  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}