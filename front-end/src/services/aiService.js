// src/services/aiService.js
/**
 * AI Service - Handles all AI-related API calls
 */

const AI_API_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:5000';

/**
 * Evaluate job description using AI
 * @param {number} jobId - The ID of the job posting to evaluate
 * @returns {Promise<Object>} - Evaluation result from AI
 */
export const evaluateJobDescription = async (jobId) => {
  try {
    const response = await fetch(`${AI_API_URL}/api/evaluate/jd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: parseInt(jobId)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Không thể phân tích job description');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error evaluating job description:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Chat with AI agent
 * @param {string} message - User message
 * @param {string} mode - Chat mode ('chat' or 'agent')
 * @param {File} file - Optional file to upload
 * @returns {Promise<Object>} - Chat response
 */
export const chatWithAI = async (message, mode = 'chat', file = null) => {
  try {
    let body;
    let headers = {};

    if (file) {
      // If file is present, use FormData
      const formData = new FormData();
      formData.append('message', message);
      formData.append('mode', mode);
      formData.append('file', file);
      body = formData;
      // Don't set Content-Type header for FormData
    } else {
      // Regular JSON request
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ message, mode });
    }

    const response = await fetch(`${AI_API_URL}/api/chat`, {
      method: 'POST',
      headers,
      body,
      credentials: 'include' // Include cookies for session
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Không thể kết nối với AI');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error chatting with AI:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get chat history
 * @returns {Promise<Object>} - Chat history
 */
export const getChatHistory = async () => {
  try {
    const response = await fetch(`${AI_API_URL}/api/chat/history`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Không thể lấy lịch sử chat');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error getting chat history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clear chat history
 * @returns {Promise<Object>} - Success status
 */
export const clearChatHistory = async () => {
  try {
    const response = await fetch(`${AI_API_URL}/api/chat/clear`, {
      method: 'POST',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Không thể xóa lịch sử chat');
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Error clearing chat history:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check AI service health
 * @returns {Promise<Object>} - Health status
 */
export const checkAIHealth = async () => {
  try {
    const response = await fetch(`${AI_API_URL}/health`, {
      method: 'GET'
    });

    const data = await response.json();

    return {
      success: response.ok,
      data: data
    };
  } catch (error) {
    console.error('❌ Error checking AI health:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Submit interview data for evaluation
 * @param {Array} interviewData - Array of questions and answers
 * @returns {Promise<Object>} - Evaluation result
 */
export const submitInterviewData = async (interviewData) => {
  try {
    console.log('📤 Sending to backend:', interviewData);
    
    const response = await fetch(`${AI_API_URL}/api/stimulate/interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: để maintain session với filepath
      body: JSON.stringify(interviewData) // Gửi trực tiếp array, backend sẽ nhận như answers
    });

    const data = await response.json();
    
    console.log('📥 Received from backend:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Không thể gửi kết quả phỏng vấn');
    }

    return {
      success: true,
      data: data.response // Backend trả về trong field "response"
    };
  } catch (error) {
    console.error('❌ Error submitting interview data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  evaluateJobDescription,
  chatWithAI,
  getChatHistory,
  clearChatHistory,
  checkAIHealth,
  submitInterviewData
};
