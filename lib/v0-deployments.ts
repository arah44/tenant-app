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
    // For now, require versionId to be provided
    if (!versionId) {
      throw new Error('versionId is required for deployment - cannot deploy without specific version');
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
    // Note: v0 SDK may not have deployments.get method yet
    // This is a placeholder for when the API is fully available
    console.log('⚠️ Deployment status check not yet implemented in v0 SDK');
    return null;
  } catch (error) {
    console.error('❌ Error getting deployment status:', error);
    return null;
  }
}

export async function deleteDeployment(deploymentId: string): Promise<boolean> {
  console.log('🗑️ Deleting deployment:', deploymentId);

  try {
    // Note: v0 SDK may not have deployments.delete method yet
    // This is a placeholder for when the API is fully available
    console.log('⚠️ Deployment deletion not yet implemented in v0 SDK');
    return false;
  } catch (error) {
    console.error('❌ Error deleting deployment:', error);
    return false;
  }
}