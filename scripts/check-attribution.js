#!/usr/bin/env node

/**
 * Attribution Checker Script
 * Original Author: ROBERA MEKONNEN
 * Year: 2025
 * 
 * This script helps check if your code is being used without proper attribution.
 * Run this script to search for potential unauthorized usage.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for potential unauthorized usage of Ethiopian Salary Calculator...\n');

// Keywords to search for that might indicate usage of your code
const keywords = [
  'Ethiopian Salary Calculator',
  'ROBERA MEKONNEN',
  'ethiopian-salary-calculator',
  'Ethiopia tax brackets 2025',
  'PAYE Ethiopia calculator'
];

// Common file extensions to check
const extensions = ['.js', '.ts', '.tsx', '.jsx', '.md', '.txt', '.json'];

function searchInFile(filePath, content) {
  const foundKeywords = [];
  
  keywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  });
  
  if (foundKeywords.length > 0) {
    console.log(`📁 Found in: ${filePath}`);
    console.log(`   Keywords: ${foundKeywords.join(', ')}`);
    console.log('');
  }
}

function searchDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          searchInFile(fullPath, content);
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });
  } catch (error) {
    // Skip directories that can't be read
  }
}

// Start searching from current directory
searchDirectory('.');

console.log('✅ Attribution check complete!');
console.log('\n📋 Remember: If you find your code being used without attribution,');
console.log('   you can contact the user or file a DMCA takedown notice.');
console.log('\n🔗 Useful resources:');
console.log('   - GitHub DMCA Policy: https://docs.github.com/en/site-policy/github-terms/github-dmca-takedown-policy');
console.log('   - Creative Commons Attribution: https://creativecommons.org/licenses/by/4.0/');
