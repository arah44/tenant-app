import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSubdomainData } from '@/lib/subdomains';
import { protocol, rootDomain } from '@/lib/utils';
import { Palette } from 'lucide-react';

export async function generateMetadata({
  params
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    return {
      title: rootDomain
    };
  }

  return {
    title: `${subdomain}.${rootDomain}`,
    description: `Subdomain page for ${subdomain}.${rootDomain}`
  };
}

export default async function SubdomainPage({
  params
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    notFound();
  }

  // If custom design exists, render it following v0 template pattern
  if (subdomainData.design?.content) {
    // Priority: deployment URL (live site) -> demo -> content -> fallback
    let generatedApp = '';
    let isLiveDeployment = false;
    
    if (subdomainData.design.deployment?.status === 'completed' && subdomainData.design.deployment.webUrl) {
      generatedApp = subdomainData.design.deployment.webUrl;
      isLiveDeployment = true;
    } else if (subdomainData.design.demo) {
      generatedApp = subdomainData.design.demo;
    } else if (subdomainData.design.content) {
      generatedApp = subdomainData.design.content;
    } else {
      // Fallback: show a message with link
      generatedApp = `
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8 bg-gray-50 flex items-center justify-center min-h-screen">
          <div class="max-w-md mx-auto text-center">
            <div class="text-4xl mb-4">✨</div>
            <h1 class="text-xl font-semibold mb-4">Landing Page Generated!</h1>
            <p class="text-gray-600 mb-4">Your custom landing page for ${subdomain} has been created.</p>
            ${subdomainData.design.content ? `
              <a href="${subdomainData.design.content}" target="_blank" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                View on v0.dev
              </a>
            ` : ''}
          </div>
        </body>
        </html>
      `;
    }

    return (
      <div className="min-h-screen">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {isLiveDeployment && (
            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border border-green-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Site
            </div>
          )}
          <Link
            href={`/s/${subdomain}/design`}
            className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-gray-900 transition-colors shadow-sm border flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Edit Design
          </Link>
          <Link
            href={`${protocol}://${rootDomain}`}
            className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 transition-colors shadow-sm border"
          >
            {rootDomain}
          </Link>
        </div>
        
        {/* Follow v0 template iframe logic exactly */}
        {generatedApp.startsWith('http') ? (
          <iframe
            src={generatedApp}
            className="w-full h-screen border-0"
            title={`${subdomain} Landing Page`}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-top-navigation-by-user-activation allow-pointer-lock"
          />
        ) : (
          <iframe
            srcDoc={generatedApp}
            className="w-full h-screen border-0"
            title={`${subdomain} Landing Page`}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-pointer-lock"
          />
        )}
      </div>
    );
  }

  // Default page if no custom design
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <Link
          href={`/s/${subdomain}/design`}
          className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-blue-600 hover:text-blue-700 transition-colors shadow-sm border flex items-center gap-2"
        >
          <Palette className="w-4 h-4" />
          Design Your Page
        </Link>
        <Link
          href={`${protocol}://${rootDomain}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {rootDomain}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-6">{subdomainData.emoji}</div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome to {subdomain}.{rootDomain}
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            This is your custom subdomain page
          </p>
          <div className="mt-8">
            <Link
              href={`/s/${subdomain}/design`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Palette className="w-5 h-5" />
              Design Your Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
