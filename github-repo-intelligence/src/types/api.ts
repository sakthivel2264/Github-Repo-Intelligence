export interface Repository {
  name: string;
  full_name: string;
  description?: string;
  stars: number;
  forks: number;
  open_issues: number;
  watchers: number;
  license?: string | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  size: number;
  language?: string | null;
}

export interface Languages {
  languages: Record<string, number>;
  primary_language: string;
  language_percentage: Record<string, number>;
}

export interface Commits {
  total_commits: number;
  commit_categories: Record<string, number>;
  top_authors: { name: string; commit_count: number }[];
  commit_frequency?: Record<string, number>;
  avg_commits_per_day?: number;
}

export interface Dependencies {
  package_managers: string[];
  total_dependencies: number;
  dependencies: Record<string, Record<string, string>>;
  dev_dependencies: Record<string, Record<string, string>>;
}

export interface FileStructure {
  file_count: number;
  directory_count: number;
  file_types: Record<string, number>;
  total_size: number;
}

export interface ReadmeAnalysis {
  length: number;
  line_count: number;
  header_count: number;
  sections: Record<string, boolean>;
  has_code_blocks: boolean;
  word_count: number;
}

export interface RepoAnalysis {
  repository: Repository;
  languages: Languages;
  commits: Commits;
  dependencies: Dependencies;
  file_structure: FileStructure;
  readme_analysis?: ReadmeAnalysis;
}
