import {
  getAllSolutions,
  getSolutionFiles,
  getFileContent,
  getProblemDifficulty,
  getProblemCategory,
  generateSlug
} from './github';
import { LeetCodeSolution, ProcessedSolution, SolutionFile } from '@/types/github';

/**
 * Fetches and processes all LeetCode solutions
 */
export async function fetchAllSolutions(): Promise<ProcessedSolution[]> {
  const solutions = await getAllSolutions();

  // Process each solution to add difficulty, category, and slug
  const processedSolutions = solutions.map((solution: LeetCodeSolution) => {
    const difficulty = getProblemDifficulty(solution.number);
    const category = getProblemCategory(solution.number);
    const slug = generateSlug(solution.title);

    return {
      ...solution,
      difficulty,
      category,
      slug,
      files: [],
      languages: [],
    };
  });

  return processedSolutions;
}

/**
 * Fetches a specific solution by its slug
 */
export async function fetchSolutionBySlug(slug: string): Promise<ProcessedSolution | null> {
  const allSolutions = await fetchAllSolutions();
  const solution = allSolutions.find(sol => sol.slug === slug);

  if (!solution) {
    return null;
  }

  // Fetch the files for this solution
  const files = await getSolutionFiles(solution.path);

  // Extract unique languages
  const languages = Array.from(new Set(files.map(file => file.language)))
    .filter(lang => lang !== 'Unknown' && lang !== 'Text' && lang !== 'Markdown');

  return {
    ...solution,
    files,
    languages,
  };
}

/**
 * Fetches the content of a specific solution file
 */
export async function fetchSolutionFileContent(file: SolutionFile): Promise<string | null> {
  return await getFileContent(file.path);
}

/**
 * Fetches featured solutions (e.g., for the homepage)
 */
export async function fetchFeaturedSolutions(count: number = 3): Promise<ProcessedSolution[]> {
  const allSolutions = await fetchAllSolutions();

  // For now, just return the first few solutions
  // In a real implementation, you might want to select specific featured solutions
  return allSolutions.slice(0, count);
}

/**
 * Fetches solutions by category
 */
export async function fetchSolutionsByCategory(category: string): Promise<ProcessedSolution[]> {
  const allSolutions = await fetchAllSolutions();

  return allSolutions.filter(solution =>
    solution.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Fetches solutions by difficulty
 */
export async function fetchSolutionsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<ProcessedSolution[]> {
  const allSolutions = await fetchAllSolutions();

  return allSolutions.filter(solution => solution.difficulty === difficulty);
}

/**
 * Gets statistics about the solutions
 */
export async function getSolutionsStatistics() {
  try {
    console.log('Fetching solution statistics...');
    const allSolutions = await fetchAllSolutions();
    console.log(`Found ${allSolutions.length} total solutions for statistics`);

    const totalSolutions = allSolutions.length;

    const easyCount = allSolutions.filter(sol => sol.difficulty === 'Easy').length;
    const mediumCount = allSolutions.filter(sol => sol.difficulty === 'Medium').length;
    const hardCount = allSolutions.filter(sol => sol.difficulty === 'Hard').length;

    // Count solutions by category
    const categoryCounts: Record<string, number> = {};
    allSolutions.forEach(solution => {
      if (solution.category) {
        categoryCounts[solution.category] = (categoryCounts[solution.category] || 0) + 1;
      }
    });

    // Get top categories
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Count solutions by language
    const languageCounts: Record<string, number> = {};

    // In a real implementation, you would analyze the actual files
    // For now, we'll use a simplified approach based on the number of solutions
    if (totalSolutions > 0) {
      languageCounts['Python'] = Math.floor(totalSolutions * 0.8);
      languageCounts['JavaScript'] = Math.floor(totalSolutions * 0.5);
      languageCounts['Java'] = Math.floor(totalSolutions * 0.3);
    }

    const languages = Object.entries(languageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSolutions,
      easyCount,
      mediumCount,
      hardCount,
      categories: Object.keys(categoryCounts).length,
      topCategories,
      languages,
    };
  } catch (error) {
    console.error('Error getting solution statistics:', error);

    // Return default empty statistics
    return {
      totalSolutions: 0,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      categories: 0,
      topCategories: [],
      languages: [],
    };
  }
}
