import { NextRequest, NextResponse } from 'next/server';
import { getSubdomainData } from '@/lib/subdomains';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const subdomain = params.path[0];
    console.log('🔄 Proxy: Serving v0 content for subdomain:', subdomain);
    
    if (!subdomain) {
      return NextResponse.json({ error: 'Subdomain required' }, { status: 400 });
    }

    const subdomainData = await getSubdomainData(subdomain);
    
    if (!subdomainData?.design?.files?.length) {
      return NextResponse.json({ error: 'No design files found' }, { status: 404 });
    }

    // Find the main component file (usually page.tsx or component.tsx)
    const mainFile = subdomainData.design.files.find(
      file => file.name.includes('page.tsx') || 
              file.name.includes('component.tsx') || 
              file.name.includes('.tsx')
    );

    if (!mainFile) {
      return NextResponse.json({ error: 'No main component file found' }, { status: 404 });
    }

    console.log('📄 Proxy: Found main file:', mainFile.name);

    // Create a simple HTML page that renders the React component
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subdomain} - Custom Landing Page</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${mainFile.content}
        
        // Try to render the component
        const root = ReactDOM.createRoot(document.getElementById('root'));
        
        // Try different possible export names
        let Component = window.Component || window.default || window.App || window.Page;
        
        if (Component) {
            root.render(React.createElement(Component));
        } else {
            root.render(React.createElement('div', { 
                className: 'p-8 text-center' 
            }, 'Component could not be rendered'));
        }
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });

  } catch (error) {
    console.error('❌ Proxy: Error serving v0 content:', error);
    return NextResponse.json(
      { error: 'Failed to serve content' },
      { status: 500 }
    );
  }
}