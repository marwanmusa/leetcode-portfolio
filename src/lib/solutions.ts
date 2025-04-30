import fs from 'fs';
import path from 'path';
import { LeetCodeSolution, ProcessedSolution, SolutionFile } from '@/types/github';

const SOLUTIONS_DIR = path.join(process.cwd(), 'src', 'content', 'solutions');

/**
 * Gets all solution files from the local filesystem
 */
export async function getAllSolutions(): Promise<ProcessedSolution[]> {
  const solutions: ProcessedSolution[] = [];
  const categories = fs.readdirSync(SOLUTIONS_DIR)
    .filter(item => {
      const itemPath = path.join(SOLUTIONS_DIR, item);
      return fs.statSync(itemPath).isDirectory() && item !== 'node_modules';
    });

  // Load metadata
  const metadataPath = path.join(SOLUTIONS_DIR, 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  for (const category of categories) {
    const categoryPath = path.join(SOLUTIONS_DIR, category);
    const files: SolutionFile[] = [];
    const languageSet = new Set<string>();

    // Process each language directory (CPP, JS, Python)
    const languageDirs = fs.readdirSync(categoryPath)
      .filter(item => fs.statSync(path.join(categoryPath, item)).isDirectory());

    for (const lang of languageDirs) {
      const langPath = path.join(categoryPath, lang);
      const solutionFiles = fs.readdirSync(langPath)
        .filter(file => fs.statSync(path.join(langPath, file)).isFile());

      for (const file of solutionFiles) {
        const filePath = path.join(langPath, file);
        const language = getLanguageFromFilename(file);
        if (language !== 'Unknown') {
          languageSet.add(language);
        }
        files.push({
          name: file,
          path: filePath.replace(/\\/g, '/'), // Convert Windows paths to forward slashes
          url: '',
          download_url: '',
          language: language,
        });
      }
    }

    // Convert category name to slug for metadata lookup
    const categorySlug = category.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '');
    
    const categoryMeta = metadata.categories[categorySlug] || {
      title: formatCategoryName(category),
      difficulty: 'Medium',
      problemCount: files.length
    };

    solutions.push({
      title: categoryMeta.title,
      path: categoryPath.replace(/\\/g, '/'),
      url: '',
      files: files,
      languages: Array.from(languageSet),
      difficulty: categoryMeta.difficulty,
      category: category,
      slug: generateSlug(category),
      number: categoryMeta.problemCount
    });
  }

  return solutions;
}

/**
 * Determine difficulty based on problem complexity or file patterns
 */
function determineDifficulty(files: SolutionFile[]): 'Easy' | 'Medium' | 'Hard' {
  // You can implement more sophisticated difficulty detection here
  // For now, returning a default value
  return 'Medium';
}

/**
 * Format category name for display
 */
function formatCategoryName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim();
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Determines the programming language from a filename
 */
function getLanguageFromFilename(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'py': return 'Python';
    case 'js': return 'JavaScript';
    case 'ts': return 'TypeScript';
    case 'cpp':
    case 'c':
    case 'h': return 'C++';
    case 'java': return 'Java';
    case 'ipynb': return 'Jupyter Notebook';
    default: return 'Unknown';
  }
}

// Keep the existing functions but update them to use local files
export async function fetchSolutionBySlug(slug: string): Promise<ProcessedSolution | null> {
  const solutions = await getAllSolutions();
  return solutions.find(sol => sol.slug === slug) || null;
}

export async function fetchSolutionFileContent(file: SolutionFile): Promise<string | null> {
  try {
    return fs.readFileSync(file.path, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

export async function fetchFeaturedSolutions(count: number = 3): Promise<ProcessedSolution[]> {
  const solutions = await getAllSolutions();
  return solutions.slice(0, count);
}

export async function fetchSolutionsByCategory(category: string): Promise<ProcessedSolution[]> {
  const solutions = await getAllSolutions();
  return solutions.filter(solution => 
    solution.category?.toLowerCase() === category.toLowerCase()
  );
}

export async function fetchSolutionsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<ProcessedSolution[]> {
  const allSolutions = await getAllSolutions();

  return allSolutions.filter(solution => solution.difficulty === difficulty);
}

/**
 * Gets statistics about the solutions
 */
export async function getSolutionsStatistics() {
  try {
    const solutions = await getAllSolutions();
    const totalSolutions = solutions.length;

    // Count solutions by difficulty
    const difficultyCount = {
      Easy: solutions.filter(s => s.difficulty === 'Easy').length,
      Medium: solutions.filter(s => s.difficulty === 'Medium').length,
      Hard: solutions.filter(s => s.difficulty === 'Hard').length,
    };

    // Count solutions by category
    const categoryCount: Record<string, number> = {};
    solutions.forEach(solution => {
      if (solution.category) {
        categoryCount[solution.category] = (categoryCount[solution.category] || 0) + 1;
      }
    });

    // Count solutions by language
    const languageCount: Record<string, number> = {};
    solutions.forEach(solution => {
      solution.languages.forEach(lang => {
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      });
    });

    return {
      totalSolutions,
      easyCount: difficultyCount.Easy,
      mediumCount: difficultyCount.Medium,
      hardCount: difficultyCount.Hard,
      categories: Object.keys(categoryCount).length,
      topCategories: Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      languages: Object.entries(languageCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  } catch (error) {
    console.error('Error getting solution statistics:', error);
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
