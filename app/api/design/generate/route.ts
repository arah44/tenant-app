import { NextRequest, NextResponse } from 'next/server';
import { generateLandingPage } from '@/lib/v0';
import { getSubdomainData, updateSubdomainDesign } from '@/lib/subdomains';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  console.log('🎨 API: Starting design generation...');
  
  try {
    const body = await request.json();
    console.log('📥 API: Request body:', body);
    
    const { subdomain, prompt } = body;

    if (!subdomain || !prompt) {
      console.log('❌ API: Missing required fields');
      return NextResponse.json(
        { error: 'Subdomain and prompt are required' },
        { status: 400 }
      );
    }

    console.log('🏗️ API: Processing subdomain:', subdomain);
    console.log('💭 API: User prompt:', prompt);

    // Generate landing page with v0
    console.log('🚀 API: Calling v0 generation...');
    const result = await generateLandingPage(prompt);
    console.log('✅ API: v0 generation completed');

    // Check if subdomain exists, if not create it with default data
    const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    console.log('🔍 API: Checking existing subdomain data for:', sanitizedSubdomain);
    
    let existingData = await getSubdomainData(subdomain);
    console.log('📋 API: Existing data:', existingData);
    
    if (!existingData) {
      console.log('➕ API: Creating default subdomain data');
      existingData = {
        emoji: '🏠',
        createdAt: Date.now(),
      };
    }

    // Update subdomain with design data
    const updatedData = {
      ...existingData,
      design: {
        chatId: result.chatId,
        content: result.content,
        files: result.files,
        webUrl: result.webUrl,
        previewUrl: result.previewUrl,
        demo: result.demo,
        lastUpdated: Date.now(),
      }
    };

    console.log('💾 API: Saving updated data to Redis...');
    console.log('🗂️ API: Updated data structure:', {
      emoji: updatedData.emoji,
      hasDesign: !!updatedData.design,
      chatId: updatedData.design?.chatId,
      previewUrl: updatedData.design?.previewUrl,
      demo: updatedData.design?.demo,
    });

    await redis.set(`subdomain:${sanitizedSubdomain}`, updatedData);
    console.log('✅ API: Data saved successfully');

    return NextResponse.json({
      success: true,
      data: updatedData.design,
    });
  } catch (error) {
    console.error('❌ API: Error generating design:', error);
    console.error('🔍 API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: `Failed to generate design: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}