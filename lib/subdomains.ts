import { redis } from '@/lib/redis';

export function isValidIcon(str: string) {
  if (str.length > 10) {
    return false;
  }

  try {
    // Primary validation: Check if the string contains at least one emoji character
    // This regex pattern matches most emoji Unicode ranges
    const emojiPattern = /[\p{Emoji}]/u;
    if (emojiPattern.test(str)) {
      return true;
    }
  } catch (error) {
    // If the regex fails (e.g., in environments that don't support Unicode property escapes),
    // fall back to a simpler validation
    console.warn(
      'Emoji regex validation failed, using fallback validation',
      error
    );
  }

  // Fallback validation: Check if the string is within a reasonable length
  // This is less secure but better than no validation
  return str.length >= 1 && str.length <= 10;
}

type SubdomainData = {
  emoji: string;
  createdAt: number;
  design?: {
    chatId: string;
    content: string;
    files?: Array<{
      name: string;
      content: string;
    }>;
    webUrl?: string;
    previewUrl?: string;
    demo?: string;
    deployment?: {
      id: string;
      webUrl: string;
      apiUrl?: string;
      inspectorUrl?: string;
      status: 'pending' | 'completed' | 'failed';
      deployedAt: number;
    };
    lastUpdated: number;
  };
};

export async function getSubdomainData(subdomain: string) {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const data = await redis.get<SubdomainData>(
    `subdomain:${sanitizedSubdomain}`
  );
  return data;
}

export async function updateSubdomainDesign(
  subdomain: string,
  design: SubdomainData['design']
) {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const existingData = await getSubdomainData(subdomain);
  
  if (!existingData) {
    throw new Error('Subdomain not found');
  }

  const updatedData: SubdomainData = {
    ...existingData,
    design
  };

  await redis.set(`subdomain:${sanitizedSubdomain}`, updatedData);
  return updatedData;
}

export async function getAllSubdomains() {
  const keys = await redis.keys('subdomain:*');

  if (!keys.length) {
    return [];
  }

  const values = await redis.mget<SubdomainData[]>(...keys);

  return keys.map((key, index) => {
    const subdomain = key.replace('subdomain:', '');
    const data = values[index];

    return {
      subdomain,
      emoji: data?.emoji || '❓',
      createdAt: data?.createdAt || Date.now(),
      hasDesign: !!data?.design
    };
  });
}
