import { v0 } from 'v0-sdk';

export interface V0Deployment {
  id: string;
  webUrl: string;
  apiUrl?: string;
  inspectorUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  deployedAt: number;
}

export async function createV0Deployment(
  chatId: string,
  versionId?: string,
  projectId?: string
): Promise<V0Deployment> {
  console.log('🚀 Creating v0 deployment...');
  console.log('📝 Parameters:', { chatId, versionId, projectId });

  try {
    // First, get the chat details to find the latest version if not provided
    if (!versionId) {
      console.log('🔍 Fetching chat details to get latest version...');
      const chatDetails = await v0.chats.get(chatId);
      versionId = chatDetails.latestVersion?.id;
      
      if (!versionId) {
        throw new Error('No version found for chat - cannot deploy');
      }
      
      console.log('✅ Found latest version:', versionId);
    }

    // Create the deployment
    console.log('🔨 Creating deployment...');
    const deploymentResult = await v0.deployments.create({
      projectId: projectId || chatId, // Use chatId as projectId if not provided
      chatId,
      versionId,
    });

    console.log('✅ Deployment created successfully');
    console.log('📊 Deployment data:', {
      id: deploymentResult.id,
      webUrl: deploymentResult.webUrl,
      apiUrl: deploymentResult.apiUrl,
      inspectorUrl: deploymentResult.inspectorUrl,
    });

    return {
      id: deploymentResult.id,
      webUrl: deploymentResult.webUrl,
      apiUrl: deploymentResult.apiUrl,
      inspectorUrl: deploymentResult.inspectorUrl,
      status: 'pending', // Deployments start as pending
      deployedAt: Date.now(),
    };
  } catch (error) {
    console.error('❌ Error creating v0 deployment:', error);
    console.error('🔍 Deployment error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      chatId,
      versionId,
      projectId,
    });
    throw new Error(`Failed to create deployment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDeploymentStatus(deploymentId: string): Promise<V0Deployment | null> {
  console.log('🔍 Checking deployment status:', deploymentId);

  try {
    const deployment = await v0.deployments.get(deploymentId);
    
    console.log('✅ Deployment status retrieved');
    console.log('📊 Status data:', {
      id: deployment.id,
      status: deployment.status,
      webUrl: deployment.webUrl,
    });

    return {
      id: deployment.id,
      webUrl: deployment.webUrl,
      apiUrl: deployment.apiUrl,
      inspectorUrl: deployment.inspectorUrl,
      status: deployment.status || 'pending',
      deployedAt: Date.now(), // We don't get this from API, so use current time
    };
  } catch (error) {
    console.error('❌ Error getting deployment status:', error);
    return null;
  }
}

export async function deleteDeployment(deploymentId: string): Promise<boolean> {
  console.log('🗑️ Deleting deployment:', deploymentId);

  try {
    await v0.deployments.delete(deploymentId);
    console.log('✅ Deployment deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting deployment:', error);
    return false;
  }
}