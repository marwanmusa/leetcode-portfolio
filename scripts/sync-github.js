#!/usr/bin/env node

/**
 * This script syncs the LeetCode solutions from GitHub to the local cache.
 * It can be run manually or as part of a build process.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_REPO_OWNER = 'marwanmusa';
const GITHUB_REPO_NAME = 'LeetCode-Challenges';
const GITHUB_RAW_CONTENT_URL = 'https://raw.githubusercontent.com';
const CACHE_DIR = path.join(process.cwd(), '.github-cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Makes an HTTP request to the GitHub API
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'LeetCode-Portfolio-Sync-Script',
        'Accept': 'application/vnd.github.v3+json',
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Fetches raw content from GitHub
 */
function fetchRawContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Gets repository contents from a specific path
 */
async function getRepoContents(path = '') {
  const url = `${GITHUB_API_URL}/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`;
  return makeRequest(url);
}

/**
 * Gets all LeetCode solutions from the repository
 */
async function getAllSolutions() {
  try {
    console.log('Fetching repository contents...');
    const contents = await getRepoContents();
    
    // Filter for directories that look like LeetCode problems
    const problemDirs = contents.filter(item => 
      item.type === 'dir' && /^\d+[._]/.test(item.name)
    );
    
    console.log(`Found ${problemDirs.length} problem directories.`);
    
    const solutions = problemDirs.map(dir => {
      // Parse the problem number and name from the directory name
      const match = dir.name.match(/^(\d+)[._](.+)$/);
      
      if (!match) {
        return {
          number: 0,
          title: dir.name,
          path: dir.path,
          url: dir.html_url,
        };
      }
      
      const number = parseInt(match[1], 10);
      // Convert directory name to a more readable title
      const title = match[2]
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      
      return {
        number,
        title,
        path: dir.path,
        url: dir.html_url,
      };
    }).sort((a, b) => a.number - b.number);
    
    // Save to cache
    const cachePath = path.join(CACHE_DIR, 'solutions.json');
    fs.writeFileSync(cachePath, JSON.stringify(solutions, null, 2));
    console.log(`Saved ${solutions.length} solutions to ${cachePath}`);
    
    return solutions;
  } catch (error) {
    console.error('Error fetching solutions:', error);
    return [];
  }
}

/**
 * Gets the files for a specific LeetCode solution
 */
async function getSolutionFiles(solutionPath) {
  try {
    console.log(`Fetching files for ${solutionPath}...`);
    const contents = await getRepoContents(solutionPath);
    
    const files = contents
      .filter(item => item.type === 'file')
      .map(file => ({
        name: file.name,
        path: file.path,
        url: file.html_url,
        download_url: file.download_url,
        // Determine language from file extension
        language: getLanguageFromFilename(file.name),
      }));
    
    // Save to cache
    const dirName = solutionPath.replace(/\//g, '_');
    const cachePath = path.join(CACHE_DIR, `${dirName}.json`);
    fs.writeFileSync(cachePath, JSON.stringify(files, null, 2));
    console.log(`Saved ${files.length} files for ${solutionPath} to ${cachePath}`);
    
    return files;
  } catch (error) {
    console.error(`Error fetching files for ${solutionPath}:`, error);
    return [];
  }
}

/**
 * Determines the programming language from a filename
 */
function getLanguageFromFilename(filename) {
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
 * Fetches and caches file content
 */
async function fetchFileContent(file) {
  try {
    console.log(`Fetching content for ${file.path}...`);
    const content = await fetchRawContent(file.download_url);
    
    // Save to cache
    const fileName = file.path.replace(/\//g, '_');
    const cachePath = path.join(CACHE_DIR, `${fileName}.txt`);
    fs.writeFileSync(cachePath, content);
    console.log(`Saved content for ${file.path} to ${cachePath}`);
    
    return content;
  } catch (error) {
    console.error(`Error fetching content for ${file.path}:`, error);
    return null;
  }
}

/**
 * Main function to sync all solutions
 */
async function syncAllSolutions() {
  try {
    console.log('Starting GitHub sync...');
    
    // Get all solutions
    const solutions = await getAllSolutions();
    
    // For each solution, get files
    for (const solution of solutions.slice(0, 5)) { // Limit to 5 for testing
      const files = await getSolutionFiles(solution.path);
      
      // For each file, fetch content
      for (const file of files) {
        await fetchFileContent(file);
      }
    }
    
    console.log('GitHub sync completed successfully!');
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

// Run the sync
syncAllSolutions();
