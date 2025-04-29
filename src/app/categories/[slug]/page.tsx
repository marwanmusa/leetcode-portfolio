import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchSolutionsByCategory } from '@/lib/solutions';
import { ProcessedSolution } from '@/types/github';

// Category descriptions
const categoryDescriptions: Record<string, string> = {
  'array': 'Problems involving arrays, lists, and sequences of elements.',
  'string': 'Problems involving string manipulation and pattern matching.',
  'linked-list': 'Problems involving singly and doubly linked lists.',
  'math': 'Problems involving mathematical concepts and calculations.',
  'dynamic-programming': 'Problems solved using dynamic programming techniques.',
  'tree': 'Problems involving binary trees, n-ary trees, and tree traversals.',
  'hash-table': 'Problems solved using hash tables and hash maps.',
  'depth-first-search': 'Problems solved using depth-first search algorithms.',
  'binary-search': 'Problems solved using binary search algorithms.',
  'greedy': 'Problems solved using greedy algorithms.',
  'backtracking': 'Problems solved using backtracking techniques.',
  'graph': 'Problems involving graph data structures and algorithms.',
};

// Format category name for display
function formatCategoryName(slug: string): string {
  // Convert slug to title case
  // e.g., 'dynamic-programming' -> 'Dynamic Programming'
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const categoryName = formatCategoryName(slug);

  return {
    title: `${categoryName} Problems | LeetCode Portfolio`,
    description: `Browse LeetCode solutions for ${categoryName} problems.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const categoryName = formatCategoryName(slug);
  const description = categoryDescriptions[slug] || `Problems related to ${categoryName}.`;

  // Fetch solutions for this category from GitHub
  const solutions = await fetchSolutionsByCategory(slug);

  // If no solutions found, we'll still show the page but with a message
  if (solutions.length === 0) {
    // You could redirect to 404 here if you prefer
    // notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400">
              Categories
            </Link>
            <span>/</span>
            <span>{categoryName}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{categoryName} Problems</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {solutions.length} solutions available
          </p>
        </div>

        {/* Solutions List */}
        {solutions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {solutions.map((solution) => (
              <div
                key={solution.number}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">#{solution.number}</span>
                      <h3 className="text-xl font-semibold">{solution.title}</h3>
                    </div>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      solution.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      solution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {solution.difficulty}
                    </span>

                    {solution.languages && solution.languages.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {solution.languages.map((lang) => (
                          <span key={lang} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/solutions/${solution.slug}`}
                    className="mt-4 md:mt-0 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View Solution →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No solutions available for this category yet.
            </p>
            <Link
              href="/categories"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ← Back to Categories
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
