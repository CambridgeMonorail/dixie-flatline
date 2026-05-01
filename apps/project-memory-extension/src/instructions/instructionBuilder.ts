import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { MemoryStore } from '../memory/memoryStore';
import { MemoryPage } from '../memory/types';

export class InstructionBuilder {
  constructor(private readonly store: MemoryStore) {}

  async build(root: string): Promise<string> {
    const pages = await this.store.list(root);
    const architecture = pages.filter((page) => page.frontmatter.type === 'architecture');
    const decisions = pages.filter((page) => page.frontmatter.type === 'decision');
    const conventions = pages.filter((page) => page.frontmatter.type === 'convention');
    const testing = pages.filter((page) => page.frontmatter.type === 'testing');
    const issues = pages.filter((page) => page.frontmatter.type === 'issue');

    return compact([
      '# Project Instructions for Copilot',
      '',
      section('Project Overview', architecture),
      section('Key Decisions and Constraints', decisions),
      section('Conventions', conventions),
      section('Testing', testing),
      section('Known Issues', issues),
      '',
      '_Generated from `.llm-wiki/memory/` by Project Memory for Copilot._'
    ].filter(Boolean).join('\n'));
  }

  async write(root: string): Promise<string> {
    await this.store.initialise(root);
    const output = await this.build(root);
    const target = path.join(root, '.github', 'copilot-instructions.md');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, output, 'utf8');
    return path.relative(root, target).replace(/\\/g, '/');
  }
}

function section(title: string, pages: MemoryPage[]): string {
  const lines = pages.flatMap((page) => toBullets(page)).slice(0, 12);

  if (lines.length === 0) {
    return '';
  }

  return [`## ${title}`, '', ...lines, ''].join('\n');
}

function toBullets(page: MemoryPage): string[] {
  const summary = page.body.match(/## Summary\s+([\s\S]*?)(?:\n## |\n# |$)/i)?.[1]
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);

  const fallback = page.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .slice(0, 2);

  return (summary?.length ? summary : fallback).map((line) => `- ${line} (${page.path})`);
}

function compact(value: string): string {
  const words = value.split(/\s+/);

  if (words.length <= 1200) {
    return value.endsWith('\n') ? value : `${value}\n`;
  }

  return `${words.slice(0, 1200).join(' ')}\n`;
}
