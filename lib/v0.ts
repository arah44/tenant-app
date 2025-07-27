import { v0 } from 'v0-sdk';

// No initialization needed - uses V0_API_KEY automatically

export interface V0GenerationResult {
  chatId: string;
  content: string;
  files?: Array<{
    name: string;
    content: string;
  }>;
  webUrl?: string;
  previewUrl?: string;
  demo?: string;
}

export async function generateLandingPage(prompt: string): Promise<V0GenerationResult> {
  console.log('🚀 Starting v0 landing page generation...');
  console.log('📝 User prompt:', prompt);
  
  try {
    const enhancedPrompt = `Create a modern, responsive landing page for a subdomain tenant. ${prompt.trim()}
    
    Requirements:
    - Use Next.js 15 with App Router
    - Use Tailwind CSS for styling
    - Make it fully responsive (mobile, tablet, desktop)
    - Include a clean, professional design
    - Add proper semantic HTML structure
    - Include engaging visual elements
    - Make it production-ready`;

    console.log('✨ Enhanced prompt:', enhancedPrompt);
    console.log('🔄 Calling v0.chats.create...');

    const response = await v0.chats.create({
      message: enhancedPrompt,
    });

    console.log('✅ v0 API response received');
    console.log('📊 Response data:', {
      id: response.id,
      url: response.url,
      filesCount: response.latestVersion?.files?.length || 0,
      fullResponse: JSON.stringify(response, null, 2),
    });

    if (!response.id) {
      throw new Error('Failed to create chat with v0 API - no chat ID returned');
    }

    const result = {
      chatId: response.id,
      content: response.url || '',
      files: response.latestVersion?.files?.map(file => ({
        name: file.name || '',
        content: file.content || '',
      })) || [],
      webUrl: (response as any).webUrl,
      previewUrl: (response as any).previewUrl,
      demo: (response as any).demo, // Add demo URL
    };

    console.log('🎉 Generation successful!');
    console.log('🔗 Chat ID:', result.chatId);
    console.log('🌐 Preview URL:', result.previewUrl);
    console.log('🎨 Demo URL:', result.demo);
    
    return result;
  } catch (error) {
    console.error('❌ Error generating landing page with v0:', error);
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Failed to generate landing page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateLandingPage(
  chatId: string,
  feedback: string
): Promise<V0GenerationResult> {
  console.log('🔄 Starting v0 landing page update...');
  console.log('🆔 Chat ID:', chatId);
  console.log('💬 Feedback:', feedback);
  
  try {
    console.log('📤 Sending message to v0...');
    
    const response = await v0.chats.sendMessage({
      chatId,
      message: feedback.trim(),
    });

    console.log('✅ v0 update response received');
    console.log('📊 Update response data:', {
      url: response.url,
      filesCount: response.latestVersion?.files?.length || 0,
    });

    const result = {
      chatId,
      content: response.url || '',
      files: response.latestVersion?.files?.map(file => ({
        name: file.name || '',
        content: file.content || '',
      })) || [],
      webUrl: (response as any).webUrl,
      previewUrl: (response as any).previewUrl,
      demo: (response as any).demo, // Add demo URL
    };

    console.log('🎉 Update successful!');
    console.log('🌐 Updated preview URL:', result.previewUrl);
    
    return result;
  } catch (error) {
    console.error('❌ Error updating landing page with v0:', error);
    console.error('🔍 Update error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Failed to update landing page: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}