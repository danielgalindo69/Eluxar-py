const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
};

walk(srcDir, (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Base background
  content = content.replace(/#0F0F0F/gi, 'var(--bg-base)');
  content = content.replace(/#0A0A0A/gi, 'var(--bg-base)');
  content = content.replace(/#0f0f13/gi, 'var(--bg-base)');

  // Surface background
  content = content.replace(/#161616/gi, 'var(--bg-surface)');
  content = content.replace(/#1A1A1A/gi, 'var(--bg-surface)');
  content = content.replace(/#1E1E1E/gi, 'var(--bg-surface)');
  content = content.replace(/#13131a/gi, 'var(--bg-surface)');

  // Gold color
  content = content.replace(/#C8A97E/gi, 'var(--color-gold)');

  // emerald colors for FragranceTest (and any others)
  content = content.replace(/emerald-500/g, '[#3A4A3F]');
  content = content.replace(/emerald-400/g, '[#A5BAA8]');

  // Chat.tsx specific generic replacements
  if (filePath.endsWith('Chat.tsx')) {
    content = content.replace(/text-gray-900/g, 'text-[#111111] dark:text-white');
    content = content.replace(/text-gray-800/g, 'text-[#111111] dark:text-[#EDEDED]');
    content = content.replace(/text-gray-500/g, 'text-[#2B2B2B]/50 dark:text-white/40');
    content = content.replace(/text-gray-400/g, 'text-[#2B2B2B]/40 dark:text-white/30');
    content = content.replace(/bg-gray-100/g, 'bg-[#F5F5F5] dark:bg-[var(--bg-surface)]');
    content = content.replace(/bg-gray-50/g, 'bg-[#EDEDED]/50 dark:bg-[var(--bg-base)]');
    content = content.replace(/border-gray-200/g, 'border-[#EDEDED] dark:border-white/10');
    content = content.replace(/border-gray-100/g, 'border-[#EDEDED]/50 dark:border-white/5');
  }

  // AdminAuth.tsx button replacement
  if (filePath.endsWith('AdminAuth.tsx')) {
    content = content.replace(
      /bg-\[#111111\] dark:bg-\[var\(--color-gold\)\] text-white dark:text-\[#111111\]/g,
      'bg-[var(--color-gold)] text-[#111111]'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.relative(srcDir, filePath)}`);
  }
});
