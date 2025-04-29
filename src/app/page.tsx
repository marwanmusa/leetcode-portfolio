import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { fetchFeaturedSolutions } from '@/lib/solutions';
import { getSolutionsStatistics } from '@/lib/solutions';
import { ProcessedSolution } from '@/types/github';

// This is a Server Component, so we can fetch data directly
export default async function Home() {
  try {
    console.log('Fetching data for homepage...');
    // Fetch real data from GitHub repository
    const featuredSolutions: ProcessedSolution[] = await fetchFeaturedSolutions(3);
    const statistics = await getSolutionsStatistics();
    console.log(`Fetched ${featuredSolutions.length} featured solutions`);
    console.log(`Total solutions: ${statistics.totalSolutions}`);

    // Use the languages from statistics
    const languages = statistics.languages || [];

    return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Marwan Musa's<br />LeetCode Solutions</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              A collection of my solutions to LeetCode problems with detailed explanations, time and space complexity analysis, and optimized implementations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/solutions"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Solutions
              </Link>
              <Link
                href="/about"
                className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                About Me
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 opacity-20"></div>
              <div className="relative z-10 text-center p-6">
                <div className="text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">{statistics.totalSolutions}</div>
                <div className="text-lg md:text-xl font-medium">Problems Solved</div>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                    {statistics.easyCount} Easy
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
                    {statistics.mediumCount} Medium
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs">
                    {statistics.hardCount} Hard
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages & Categories Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 rounded-xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Programming Languages</h2>
            <div className="space-y-4">
              {languages.map((language, index: number) => (
                <div key={index} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{language.name}</span>
                    <span>{language.count} solutions</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${(language.count / statistics.totalSolutions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {statistics.topCategories && statistics.topCategories.length > 0 ? (
                statistics.topCategories.slice(0, 4).map((category, index) => (
                  <Link
                    key={index}
                    href={`/categories/${category.name.toLowerCase()}`}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.count} solutions</p>
                  </Link>
                ))
              ) : (
                <>
                  <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-1">Arrays</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">0 solutions</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-1">Strings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">0 solutions</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-1">Dynamic Programming</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">0 solutions</p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-1">Graphs</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">0 solutions</p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 text-right">
              <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                View All Categories →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Solutions Section */}
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Solutions</h2>
          <p className="text-gray-600 dark:text-gray-400">Check out some of my best LeetCode solutions</p>
        </div>

        {featuredSolutions && featuredSolutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSolutions.map((solution) => (
              <div
                key={solution.number}
                className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">#{solution.number}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      solution.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      solution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {solution.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Category: {solution.category}
                  </p>
                  <Link
                    href={`/solutions/${solution.slug}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View Solution →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-gray-200 dark:border-gray-800 rounded-lg">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No solutions found in the GitHub repository yet.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Solutions will appear here once they are added to the repository.
            </p>
          </div>
        )}
        <div className="mt-8 text-center">
          <Link
            href="/solutions"
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            View All Solutions
          </Link>
        </div>
      </section>

      {/* GitHub Integration Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 rounded-xl mb-12">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">GitHub Integration</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              All solutions are available on GitHub with detailed explanations and test cases.
              The code is regularly updated with new solutions and optimizations.
            </p>
            <a
              href="https://github.com/marwanmusa/LeetCode-Challenges"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
          <div className="md:w-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 font-mono">two-sum.py</span>
            </div>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm font-mono">
              <code>
{`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Create a hash map to store values and their indices
        seen = {}

        # Iterate through the array
        for i, num in enumerate(nums):
            # Calculate the complement
            complement = target - num

            # If complement exists in the hash map, return its index and current index
            if complement in seen:
                return [seen[complement], i]

            # Otherwise, add current number and its index to the hash map
            seen[num] = i

        # No solution found
        return []`}
              </code>
            </pre>
          </div>
        </div>
      </section>
    </MainLayout>
    );
  } catch (error) {
    console.error('Error rendering homepage:', error);

    // Fallback UI in case of error
    return (
      <MainLayout>
        <div className="py-12 text-center">
          <h1 className="text-3xl font-bold mb-6">LeetCode Portfolio</h1>
          <p className="text-xl mb-8">
            There was an error loading the data from GitHub. Please try again later.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg inline-block text-left">
            <h2 className="font-semibold mb-2">Possible reasons:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>GitHub API rate limit exceeded</li>
              <li>Network connectivity issues</li>
              <li>Repository structure doesn't match expected format</li>
            </ul>
          </div>
        </div>
      </MainLayout>
    );
  }
}
