from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

class RepositoryInfo(BaseModel):
    name: str
    full_name: str
    description: Optional[str]
    stars: int
    forks: int
    open_issues: int
    watchers: int
    license: Optional[str]
    default_branch: str
    created_at: str
    updated_at: str
    size: int
    language: Optional[str]

class CommitAuthor(BaseModel):
    name: str
    email: str
    commit_count: int

class CommitAnalysis(BaseModel):
    total_commits: int
    commit_categories: Dict[str, int]
    top_authors: List[CommitAuthor]
    commit_frequency: Dict[str, int]
    avg_commits_per_day: float

class LanguageStats(BaseModel):
    languages: Dict[str, int]
    primary_language: str
    language_percentage: Dict[str, float]

class DependencyInfo(BaseModel):
    package_managers: List[str]
    total_dependencies: int
    dependencies: Dict[str, List[str]]
    outdated_dependencies: List[str]

class CodeQualityMetrics(BaseModel):
    file_count: int
    total_lines: int
    code_lines: int
    comment_lines: int
    blank_lines: int
    complexity_score: float
    duplication_percentage: float

class RepositoryAnalysis(BaseModel):
    repository: RepositoryInfo
    languages: LanguageStats
    commits: CommitAnalysis
    dependencies: DependencyInfo
    code_quality: CodeQualityMetrics
    readme_analysis: Optional[Dict[str, Any]]
