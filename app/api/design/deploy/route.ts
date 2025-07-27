import { NextRequest, NextResponse } from 'next/server';
import { createV0Deployment } from '@/lib/v0-deployments';
import { getSubdomainData, updateSubdomainDesign } from '@/lib/subdomains';

export async function POST(request: NextRequest) {
  console.log('🚀 API: Starting deployment process...');
  
  try {
    const body = await request.json();
    console.log('📥 API: Request body:', body);
    
    const { subdomain } = body;

    if (!subdomain) {
      console.log('❌ API: Missing subdomain');
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      );
    }

    console.log('🏗️ API: Processing deployment for subdomain:', subdomain);

    // Get existing subdomain data
    const existingData = await getSubdomainData(subdomain);
    if (!existingData?.design?.chatId) {
      console.log('❌ API: No design found for subdomain');
      return NextResponse.json(
        { error: 'No design found for this subdomain. Create a design first.' },
        { status: 404 }
      );
    }

    console.log('📋 API: Found existing design:', {
      chatId: existingData.design.chatId,
      hasContent: !!existingData.design.content,
    });

    // Create v0 deployment
    console.log('🚀 API: Creating v0 deployment...');
    const deployment = await createV0Deployment(existingData.design.chatId);
    console.log('✅ API: Deployment created successfully');

    // Update subdomain with deployment info
    const updatedData = await updateSubdomainDesign(subdomain, {
      ...existingData.design,
      deployment,
      lastUpdated: Date.now(),
    });

    console.log('💾 API: Updated subdomain data with deployment info');
    console.log('🗂️ API: Deployment info:', {
      deploymentId: deployment.id,
      webUrl: deployment.webUrl,
      status: deployment.status,
    });

    return NextResponse.json({
      success: true,
      deployment,
    });
  } catch (error) {
    console.error('❌ API: Error creating deployment:', error);
    console.error('🔍 API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: `Failed to create deployment: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}