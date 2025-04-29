import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { getSolutionsStatistics } from '@/lib/solutions';

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

export const metadata = {
  title: 'Categories | LeetCode Portfolio',
  description: 'Browse LeetCode solutions by category.',
};

export default async function CategoriesPage() {
  // Get statistics to determine category counts
  const stats = await getSolutionsStatistics();

  // Create categories array from the statistics
  const categories = stats.topCategories.map((category, index) => ({
    id: index + 1,
    name: formatCategoryName(category.name),
    count: category.count,
    slug: category.name.toLowerCase(),
    description: categoryDescriptions[category.name.toLowerCase()] || `Problems related to ${formatCategoryName(category.name)}.`,
  }));

  // Add any missing categories from our descriptions that might not be in the top categories
  Object.keys(categoryDescriptions).forEach(slug => {
    if (!categories.some(cat => cat.slug === slug)) {
      categories.push({
        id: categories.length + 1,
        name: formatCategoryName(slug),
        count: 0, // No solutions yet
        slug,
        description: categoryDescriptions[slug],
      });
    }
  });
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Solution Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse LeetCode solutions organized by problem category.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {category.description}
              </p>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                View Solutions →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
