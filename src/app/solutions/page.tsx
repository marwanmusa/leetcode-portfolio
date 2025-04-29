"use client";

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { fetchAllSolutions } from '@/lib/solutions';

// This will be replaced with real data from GitHub
// Keeping this as a fallback in case the GitHub API fails
const mockSolutions = [
  {
    id: 1,
    number: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    slug: 'two-sum',
    languages: ['Python', 'JavaScript', 'Java'],
    lastUpdated: '2023-10-15',
  },
  {
    id: 2,
    number: 2,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    category: 'Linked List',
    slug: 'add-two-numbers',
    languages: ['Python', 'JavaScript'],
    lastUpdated: '2023-09-28',
  },
  {
    id: 3,
    number: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'String',
    slug: 'longest-substring-without-repeating-characters',
    languages: ['Python', 'Java'],
    lastUpdated: '2023-11-05',
  },
  {
    id: 4,
    number: 4,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Array',
    slug: 'median-of-two-sorted-arrays',
    languages: ['Python'],
    lastUpdated: '2023-08-12',
  },
  {
    id: 5,
    number: 5,
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    category: 'String',
    slug: 'longest-palindromic-substring',
    languages: ['Python', 'JavaScript'],
    lastUpdated: '2023-10-22',
  },
  {
    id: 6,
    number: 6,
    title: 'ZigZag Conversion',
    difficulty: 'Medium',
    category: 'String',
    slug: 'zigzag-conversion',
    languages: ['Python'],
    lastUpdated: '2023-07-18',
  },
  {
    id: 7,
    number: 7,
    title: 'Reverse Integer',
    difficulty: 'Medium',
    category: 'Math',
    slug: 'reverse-integer',
    languages: ['Python', 'JavaScript', 'Java'],
    lastUpdated: '2023-09-05',
  },
  {
    id: 8,
    number: 8,
    title: 'String to Integer (atoi)',
    difficulty: 'Medium',
    category: 'String',
    slug: 'string-to-integer-atoi',
    languages: ['Python', 'JavaScript'],
    lastUpdated: '2023-08-30',
  },
  {
    id: 9,
    number: 9,
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Math',
    slug: 'palindrome-number',
    languages: ['Python', 'JavaScript', 'Java'],
    lastUpdated: '2023-11-12',
  },
  {
    id: 10,
    number: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Array',
    slug: 'container-with-most-water',
    languages: ['Python', 'JavaScript'],
    lastUpdated: '2023-10-05',
  },
  {
    id: 11,
    number: 15,
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Array',
    slug: '3sum',
    languages: ['Python'],
    lastUpdated: '2023-09-18',
  },
  {
    id: 12,
    number: 20,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    slug: 'valid-parentheses',
    languages: ['Python', 'JavaScript', 'Java'],
    lastUpdated: '2023-11-01',
  },
];

// Categories for filter
const categories = [
  'Array',
  'String',
  'Linked List',
  'Math',
  'Dynamic Programming',
  'Tree',
  'Hash Table',
  'Depth-First Search',
  'Binary Search',
  'Greedy',
  'Stack',
  'Graph',
];

// Languages for filter
const languages = ['Python', 'JavaScript', 'Java', 'C++', 'Go'];

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<Array<{
    id: number;
    number: number;
    title: string;
    difficulty: string;
    category: string;
    slug: string;
    languages: string[];
    lastUpdated: string;
  }>>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadSolutions() {
      try {
        const fetchedSolutions = await fetchAllSolutions();
        const processedSolutions = fetchedSolutions.map((solution, index) => ({
          id: index + 1, // Add an `id` if missing
          number: solution.number || 0,
          title: solution.title || 'Untitled',
          difficulty: solution.difficulty || 'Medium',
          category: solution.category || 'Uncategorized',
          slug: solution.slug || `solution-${index + 1}`,
          languages: solution.languages || [],
          lastUpdated: solution.lastUpdated || 'Unknown',
        }));
        setSolutions(processedSolutions);
      } catch (error) {
        console.error('Error fetching solutions:', error);
        // Fallback to mock data if GitHub API fails
        setSolutions(mockSolutions);
      }
    }

    loadSolutions();
  }, []);

  const filteredSolutions = solutions.filter((solution) => {
    const matchesDifficulty =
      selectedDifficulty.length === 0 || selectedDifficulty.includes(solution.difficulty);
    const matchesCategory =
      !selectedCategory || solution.category.toLowerCase() === selectedCategory;
    const matchesLanguage =
      !selectedLanguage || solution.languages.map((lang) => lang.toLowerCase()).includes(selectedLanguage);
    const matchesSearch =
      !searchQuery ||
      solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solution.number.toString().includes(searchQuery);

    return matchesDifficulty && matchesCategory && matchesLanguage && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Solutions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse all my LeetCode solutions with detailed explanations and code implementations.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <div className="space-y-2">
                {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                  <div key={difficulty} className="flex items-center">
                    <input
                      type="checkbox"
                      id={difficulty.toLowerCase()}
                      className="mr-2"
                      checked={selectedDifficulty.includes(difficulty)}
                      onChange={(e) => {
                        setSelectedDifficulty((prev) =>
                          e.target.checked
                            ? [...prev, difficulty]
                            : prev.filter((d) => d !== difficulty)
                        );
                      }}
                    />
                    <label htmlFor={difficulty.toLowerCase()}>{difficulty}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="">All Languages</option>
                {languages.map((language) => (
                  <option key={language} value={language.toLowerCase()}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by title or number..."
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Solutions Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left">
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Difficulty</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Languages</th>
                <th className="p-4 font-semibold">Last Updated</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredSolutions.map((solution) => (
                <tr key={solution.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="p-4 text-gray-500 dark:text-gray-400">{solution.number}</td>
                  <td className="p-4 font-medium">{solution.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      solution.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      solution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {solution.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/categories/${solution.category.toLowerCase()}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {solution.category}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {solution.languages.map((lang) => (
                        <span key={lang} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{solution.lastUpdated}</td>
                  <td className="p-4">
                    <Link
                      href={`/solutions/${solution.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Solutions List (visible on small screens) */}
        <div className="md:hidden grid grid-cols-1 gap-4 mb-8">
          {filteredSolutions.map((solution) => (
            <div
              key={solution.id}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">#{solution.number}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  solution.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  solution.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {solution.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{solution.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Category:
                  <Link href={`/categories/${solution.category.toLowerCase()}`} className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                    {solution.category}
                  </Link>
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Updated: {solution.lastUpdated}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {solution.languages.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    {lang}
                  </span>
                ))}
              </div>
              <Link
                href={`/solutions/${solution.slug}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View Solution →
              </Link>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">1</span> to <span className="font-medium">12</span> of <span className="font-medium">150</span> solutions
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1">
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
