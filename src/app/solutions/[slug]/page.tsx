import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchSolutionBySlug, fetchSolutionFileContent } from '@/lib/solutions';
import { ProcessedSolution, SolutionFile } from '@/types/github';
import { fetchAllSolutions } from '@/lib/solutions';

// Problem descriptions for common LeetCode problems
// In a real implementation, you might want to scrape these from LeetCode
const problemDescriptions: Record<string, any> = {
  'two-sum': {
    problem: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    approach: 'We can use a hash map to store the values we\'ve seen so far. For each element, we check if the complement (target - current element) exists in the hash map. If it does, we\'ve found our solution. If not, we add the current element to the hash map and continue.',
    complexity: {
      time: 'O(n)',
      space: 'O(n)'
    }
  },
  // Add more problem descriptions as needed
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const solution = await fetchSolutionBySlug(slug);

  if (!solution) {
    return {
      title: 'Solution Not Found',
    };
  }

  return {
    title: `${solution.title} | LeetCode Solution`,
    description: `Detailed explanation and code implementation for the ${solution.title} problem.`,
  };
}

export async function getStaticPaths() {
  const solutions = await fetchAllSolutions();
  const paths = solutions.map((solution) => ({
    params: { slug: solution.slug },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const solution = await fetchSolutionBySlug(params.slug);

  if (!solution) {
    return { notFound: true };
  }

  return {
    props: {
      solution,
    },
    revalidate: 3600, // Revalidate every hour
  };
}

export default async function SolutionPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  // Fetch the solution from GitHub
  const solution = await fetchSolutionBySlug(slug);

  // If solution doesn't exist, return 404
  if (!solution) {
    notFound();
  }

  // Fetch content for each file
  const filesWithContent = await Promise.all(
    solution.files.map(async (file) => {
      const content = await fetchSolutionFileContent(file);
      return { ...file, content };
    })
  );

  // Get problem description if available, or use a default
  const description = problemDescriptions[slug] || {
    problem: 'No detailed description available for this problem.',
    examples: [],
    approach: 'Check the code implementation for details on the approach used.',
    complexity: {
      time: 'Not specified',
      space: 'Not specified'
    }
  };

  // Enhance solution with file content and description
  const enhancedSolution = {
    ...solution,
    files: filesWithContent,
    ...description
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link href="/solutions" className="hover:text-blue-600 dark:hover:text-blue-400">
              Solutions
            </Link>
            <span>/</span>
            <span>{enhancedSolution.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Problem #{enhancedSolution.number}</div>
              <h1 className="text-3xl md:text-4xl font-bold">{enhancedSolution.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm ${
                enhancedSolution.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                enhancedSolution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {enhancedSolution.difficulty}
              </span>
              <Link
                href={`/categories/${enhancedSolution.category?.toLowerCase()}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                {enhancedSolution.category}
              </Link>
            </div>
          </div>

          {/* GitHub Link */}
          <div className="mt-4">
            <a
              href={enhancedSolution.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Problem Statement */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Problem</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="mb-6">{enhancedSolution.problem}</p>

            {enhancedSolution.examples && enhancedSolution.examples.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mb-3">Examples:</h3>
                <div className="space-y-4">
                  {enhancedSolution.examples.map((example: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <p className="font-mono text-sm mb-2"><strong>Input:</strong> {example.input}</p>
                      <p className="font-mono text-sm mb-2"><strong>Output:</strong> {example.output}</p>
                      {example.explanation && (
                        <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Explanation:</strong> {example.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Approach */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Approach</h2>
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="mb-6">{enhancedSolution.approach}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Time Complexity</h3>
                <p className="font-mono">{enhancedSolution.complexity?.time}</p>
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Space Complexity</h3>
                <p className="font-mono">{enhancedSolution.complexity?.space}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Code Implementation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Code Implementation</h2>

          {/* Files List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Files:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enhancedSolution.files.map((file: SolutionFile) => (
                <a
                  key={file.path}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{file.language}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Code Blocks */}
          {enhancedSolution.files.map((file: SolutionFile) => (
            <div key={file.path} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{file.name}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{file.language}</span>
              </div>
              <div className="relative">
                <pre className="p-6 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                  <code className="font-mono text-sm">{file.content || 'Loading code...'}</code>
                </pre>
                <button
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 hover:text-white"
                  aria-label="Copy code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/solutions"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            ← Back to Solutions
          </Link>
          <Link
            href={`/categories/${enhancedSolution.category?.toLowerCase()}`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            More {enhancedSolution.category} Problems →
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
