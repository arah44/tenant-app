'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Palette, RefreshCw, Rocket, ExternalLink } from 'lucide-react';

interface DesignInterfaceProps {
  subdomain: string;
  currentDesign?: {
    chatId: string;
    content: string;
    lastUpdated: number;
    deployment?: {
      id: string;
      webUrl: string;
      status: 'pending' | 'completed' | 'failed';
      deployedAt: number;
    };
  };
  onDesignUpdate?: () => void;
}

export function DesignInterface({ subdomain, currentDesign, onDesignUpdate }: DesignInterfaceProps) {
  const [prompt, setPrompt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/design/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain,
          prompt: prompt.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPrompt('');
        onDesignUpdate?.();
      } else {
        alert('Failed to generate design: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating design:', error);
      alert('Failed to generate design');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    if (!feedback.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/design/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain,
          feedback: feedback.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setFeedback('');
        setShowUpdateDialog(false);
        onDesignUpdate?.();
      } else {
        alert('Failed to update design: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating design:', error);
      alert('Failed to update design');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await fetch('/api/design/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        onDesignUpdate?.();
        alert('Deployment created successfully! It may take a few minutes to go live.');
      } else {
        alert('Failed to deploy: ' + result.error);
      }
    } catch (error) {
      console.error('Error deploying:', error);
      alert('Failed to deploy');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Design Your Landing Page
          </CardTitle>
          <CardDescription>
            Use AI to create a custom landing page for your subdomain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentDesign ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="design-prompt">Describe your landing page</Label>
                <Input
                  id="design-prompt"
                  placeholder="e.g., A modern portfolio site with dark theme and animated elements"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Landing Page'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">✓ Landing page generated!</p>
                <p className="text-green-600 text-sm mt-1">
                  Last updated: {new Date(currentDesign.lastUpdated).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Update Design
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Your Design</DialogTitle>
                        <DialogDescription>
                          Describe what changes you'd like to make to your landing page.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="feedback">Feedback and changes</Label>
                          <Input
                            id="feedback"
                            placeholder="e.g., Make the header bigger and add a contact form"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isUpdating}
                          />
                        </div>
                        <Button 
                          onClick={handleUpdate} 
                          disabled={!feedback.trim() || isUpdating}
                          className="w-full"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Update Design'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {currentDesign.content && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(currentDesign.content, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                </div>

                {/* Deployment Section */}
                <div className="border-t pt-3">
                  {currentDesign.deployment ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Deployment Status:</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          currentDesign.deployment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : currentDesign.deployment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentDesign.deployment.status}
                        </span>
                      </div>
                      
                      {currentDesign.deployment.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(currentDesign.deployment!.webUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Live Site
                        </Button>
                      )}
                      
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="w-full"
                        onClick={handleDeploy}
                        disabled={isDeploying}
                      >
                        {isDeploying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redeploying...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Redeploy
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={handleDeploy}
                      disabled={isDeploying}
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Deploy to Live Site
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}