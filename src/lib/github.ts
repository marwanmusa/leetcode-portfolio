/**
 * GitHub API integration for fetching LeetCode solutions
 */

import NodeCache from 'node-cache';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_REPO_OWNER = 'marwanmusa';
const GITHUB_REPO_NAME = 'LeetCode-Challenges';
const GITHUB_RAW_CONTENT_URL = 'https://raw.githubusercontent.com';

// Initialize a cache with a default TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Fetches repository contents from a specific path
 */
function fetchWithCache<T>(key: string, fetchFunction: () => Promise<T>): Promise<T> {
  const cachedData = cache.get<T>(key);
  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    return Promise.resolve(cachedData);
  }

  console.log(`Cache miss for key: ${key}. Fetching from source...`);
  return fetchFunction().then((data: T) => {
    cache.set(key, data);
    return data;
  });
}

// Update getRepoContents to use caching
export async function getRepoContents(path: string = '') {
  const cacheKey = `repoContents:${path}`;
  return fetchWithCache(cacheKey, async () => {
    const url = `${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`;

    // For public repositories, we don't need authentication
    // If you hit rate limits, you can add a GitHub token here
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Add support for authentication using a GitHub token
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    try {
      console.log(`Fetching GitHub contents from: ${url}`);
      const response = await fetch(url, {
        headers,
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      // Improve error handling by providing detailed error messages
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error (${response.status}): ${errorText}`);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 1} items from GitHub`);
      return data;
    } catch (error) {
      console.error('Error fetching repo contents:', error);
      return [];
    }
  });
}

// Update getFileContent to use caching
export async function getFileContent(path: string) {
  const cacheKey = `fileContent:${path}`;
  return fetchWithCache(cacheKey, async () => {
    const url = `${GITHUB_RAW_CONTENT_URL}/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/${path}`;

    try {
      console.log(`Fetching file content from: ${url}`);
      const response = await fetch(url, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      // Improve error handling by providing detailed error messages
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub raw content error (${response.status}): ${errorText}`);
        throw new Error(`GitHub raw content error: ${response.status} - ${errorText}`);
      }

      const content = await response.text();
      console.log(`Successfully fetched file content (${content.length} bytes)`);
      return content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      return null;
    }
  });
}

/**
 * Gets all LeetCode solutions from the repository
 */
export async function getAllSolutions() {
  console.log('Fetching all LeetCode solutions from repository...');
  const contents = await getRepoContents();

  if (!Array.isArray(contents)) {
    console.error('Repository contents is not an array:', contents);
    return [];
  }

  console.log(`Found ${contents.length} items in repository root`);

  // Filter for directories that look like LeetCode problems
  // Typically they start with a number followed by a dot or underscore
  const problemDirs = contents.filter(item =>
    item.type === 'dir' && /^\d+[._]/.test(item.name)
  );

  console.log(`Found ${problemDirs.length} potential LeetCode problem directories`);

  const solutions = problemDirs.map(dir => {
    // Parse the problem number and name from the directory name
    const match = dir.name.match(/^(\d+)[._](.+)$/);

    if (!match) {
      return {
        number: 0,
        title: dir.name,
        path: dir.path,
        url: dir.html_url,
        difficulty: 'Medium' as const, // Default difficulty
        category: 'Algorithm', // Default category
        slug: generateSlug(dir.name),
      };
    }

    const number = parseInt(match[1], 10);
    // Convert directory name to a more readable title
    // e.g., "two-sum" -> "Two Sum"
    const title = match[2]
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Get difficulty and category
    const difficulty = getProblemDifficulty(number);
    const category = getProblemCategory(number);
    const slug = generateSlug(title);

    return {
      number,
      title,
      path: dir.path,
      url: dir.html_url,
      difficulty,
      category,
      slug,
    };
  }).sort((a, b) => a.number - b.number);

  console.log(`Processed ${solutions.length} LeetCode solutions`);
  return solutions;
}

/**
 * Gets the files for a specific LeetCode solution
 */
export async function getSolutionFiles(path: string) {
  const contents = await getRepoContents(path);

  if (!Array.isArray(contents)) {
    return [];
  }

  return contents
    .filter(item => item.type === 'file')
    .map(file => ({
      name: file.name,
      path: file.path,
      url: file.html_url,
      download_url: file.download_url,
      // Determine language from file extension
      language: getLanguageFromFilename(file.name),
    }));
}

/**
 * Determines the programming language from a filename
 */
function getLanguageFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'py':
      return 'Python';
    case 'js':
      return 'JavaScript';
    case 'ts':
      return 'TypeScript';
    case 'java':
      return 'Java';
    case 'cpp':
    case 'c':
    case 'h':
      return 'C++';
    case 'go':
      return 'Go';
    case 'rb':
      return 'Ruby';
    case 'php':
      return 'PHP';
    case 'swift':
      return 'Swift';
    case 'kt':
    case 'kts':
      return 'Kotlin';
    case 'cs':
      return 'C#';
    case 'rs':
      return 'Rust';
    case 'md':
      return 'Markdown';
    case 'txt':
      return 'Text';
    default:
      return 'Unknown';
  }
}

/**
 * Gets difficulty information for a LeetCode problem
 * Note: This is a mock function since we don't have direct access to LeetCode's API
 * In a real implementation, you might want to scrape LeetCode or use a third-party API
 */
export function getProblemDifficulty(problemNumber: number): 'Easy' | 'Medium' | 'Hard' {
  // This is a simplified mapping of some common problems
  // In a real implementation, you would want a more complete dataset
  const difficultyMap: Record<number, 'Easy' | 'Medium' | 'Hard'> = {
    1: 'Easy',    // Two Sum
    2: 'Medium',  // Add Two Numbers
    3: 'Medium',  // Longest Substring Without Repeating Characters
    4: 'Hard',    // Median of Two Sorted Arrays
    5: 'Medium',  // Longest Palindromic Substring
    // Add more mappings as needed
  };

  return difficultyMap[problemNumber] || 'Medium'; // Default to Medium if unknown
}

/**
 * Gets category information for a LeetCode problem
 * Note: This is a mock function since we don't have direct access to LeetCode's API
 */
export function getProblemCategory(problemNumber: number): string {
  // This is a simplified mapping of some common problems
  const categoryMap: Record<number, string> = {
    1: 'Array',       // Two Sum
    2: 'Linked List', // Add Two Numbers
    3: 'String',      // Longest Substring Without Repeating Characters
    4: 'Array',       // Median of Two Sorted Arrays
    5: 'String',      // Longest Palindromic Substring
    // Add more mappings as needed
  };

  return categoryMap[problemNumber] || 'Algorithm'; // Default to Algorithm if unknown
}

/**
 * Generates a slug from a problem title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')  // Remove non-word chars
    .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')       // Trim hyphens from start
    .replace(/-+$/, '');      // Trim hyphens from end
}
