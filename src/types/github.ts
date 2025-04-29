/**
 * Types for GitHub API responses and LeetCode solutions
 */

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface LeetCodeSolution {
  number: number;
  title: string;
  path: string;
  url: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category?: string;
  slug?: string;
}

export interface SolutionFile {
  name: string;
  path: string;
  url: string;
  download_url: string;
  language: string;
  content?: string;
}

export interface ProcessedSolution extends LeetCodeSolution {
  files: SolutionFile[];
  languages: string[];
  lastUpdated?: string;
}
