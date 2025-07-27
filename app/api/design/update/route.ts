import { NextRequest, NextResponse } from 'next/server';
import { updateLandingPage } from '@/lib/v0';
import { getSubdomainData, updateSubdomainDesign } from '@/lib/subdomains';

export async function POST(request: NextRequest) {
  try {
    const { subdomain, feedback } = await request.json();

    if (!subdomain || !feedback) {
      return NextResponse.json(
        { error: 'Subdomain and feedback are required' },
        { status: 400 }
      );
    }

    // Get existing subdomain data
    const existingData = await getSubdomainData(subdomain);
    if (!existingData?.design?.chatId) {
      return NextResponse.json(
        { error: 'No existing design found for this subdomain' },
        { status: 404 }
      );
    }

    // Update landing page with v0
    const result = await updateLandingPage(existingData.design.chatId, feedback);

    // Update subdomain with new design data
    const updatedData = await updateSubdomainDesign(subdomain, {
      chatId: result.chatId,
      content: result.content,
      files: result.files,
      webUrl: result.webUrl,
      previewUrl: result.previewUrl,
      demo: result.demo,
      lastUpdated: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: updatedData.design,
    });
  } catch (error) {
    console.error('Error updating design:', error);
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    );
  }
}