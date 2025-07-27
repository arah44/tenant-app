import { notFound } from 'next/navigation';
import { getSubdomainData } from '@/lib/subdomains';
import { DesignInterface } from '@/components/design-interface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DesignPageProps {
  params: {
    subdomain: string;
  };
}

export default async function DesignPage({ params }: DesignPageProps) {
  const { subdomain } = params;
  const data = await getSubdomainData(subdomain);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            href={`/s/${subdomain}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {subdomain}
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {data.emoji} {subdomain}
            </CardTitle>
            <CardDescription>
              Customize your subdomain's landing page with AI-powered design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DesignInterface 
              subdomain={subdomain}
              currentDesign={data.design}
            />
          </CardContent>
        </Card>

        {data.design && (
          <Card>
            <CardHeader>
              <CardTitle>Current Design</CardTitle>
              <CardDescription>
                Preview your current landing page design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <iframe
                  src={data.design.content}
                  className="w-full h-full rounded-lg"
                  title="Landing Page Preview"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}