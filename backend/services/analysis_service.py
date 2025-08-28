from typing import Dict, List, Optional
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import re
import json

class AnalysisService:
    
    def analyze_commits(self, commits: List[Dict]) -> Dict:
        """Analyze commit patterns and categorize them"""
        if not commits:
            return {
                "total_commits": 0,
                "commit_categories": {},
                "top_authors": [],
                "commit_frequency": {},
                "avg_commits_per_day": 0.0
            }

        # Categorize commits by message patterns
        categories = {
            "feat": 0, "fix": 0, "docs": 0, "style": 0,
            "refactor": 0, "test": 0, "chore": 0, "others": 0
        }
        
        author_stats = Counter()
        commit_dates = []

        for commit in commits:
            message = commit.get('commit', {}).get('message', '').lower()
            author = commit.get('commit', {}).get('author', {}).get('name', 'Unknown')
            date_str = commit.get('commit', {}).get('author', {}).get('date')
            
            # Categorize commit
            if any(keyword in message for keyword in ['feat:', 'feature:']):
                categories['feat'] += 1
            elif any(keyword in message for keyword in ['fix:', 'bug:', 'hotfix:']):
                categories['fix'] += 1
            elif any(keyword in message for keyword in ['docs:', 'doc:']):
                categories['docs'] += 1
            elif any(keyword in message for keyword in ['style:', 'format:']):
                categories['style'] += 1
            elif any(keyword in message for keyword in ['refactor:', 'refact:']):
                categories['refactor'] += 1
            elif any(keyword in message for keyword in ['test:', 'tests:']):
                categories['test'] += 1
            elif any(keyword in message for keyword in ['chore:', 'build:', 'ci:']):
                categories['chore'] += 1
            else:
                categories['others'] += 1

            author_stats[author] += 1
            if date_str:
                commit_dates.append(date_str)

        # Calculate commit frequency
        frequency = self._calculate_commit_frequency(commit_dates)
        avg_per_day = len(commits) / max(len(set(date[:10] for date in commit_dates)), 1)

        return {
            "total_commits": len(commits),
            "commit_categories": categories,
            "top_authors": [{"name": name, "commit_count": count} 
                          for name, count in author_stats.most_common(10)],
            "commit_frequency": frequency,
            "avg_commits_per_day": round(avg_per_day, 2)
        }

    def _calculate_commit_frequency(self, dates: List[str]) -> Dict[str, int]:
        """Calculate commit frequency by day of week"""
        frequency = defaultdict(int)
        for date_str in dates:
            try:
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                day_name = date.strftime('%A')
                frequency[day_name] += 1
            except:
                continue
        return dict(frequency)

    def analyze_languages(self, languages: Dict[str, int]) -> Dict:
        """Analyze programming languages usage"""
        if not languages:
            return {
                "languages": {},
                "primary_language": "Unknown",
                "language_percentage": {}
            }

        total_bytes = sum(languages.values())
        percentages = {
            lang: round((bytes_count / total_bytes) * 100, 2)
            for lang, bytes_count in languages.items()
        }
        
        primary_language = max(languages.items(), key=lambda x: x[1])[0] if languages else "Unknown"

        return {
            "languages": languages,
            "primary_language": primary_language,
            "language_percentage": percentages
        }

    def analyze_readme(self, readme_content: Optional[str]) -> Optional[Dict]:
        """Analyze README content"""
        if not readme_content:
            return None

        lines = readme_content.split('\n')
        headers = [line for line in lines if line.startswith('#')]
        
        # Count different sections
        sections = {
            "installation": any(word in readme_content.lower() 
                              for word in ['install', 'setup', 'getting started']),
            "usage": any(word in readme_content.lower() 
                        for word in ['usage', 'example', 'how to']),
            "contributing": 'contribut' in readme_content.lower(),
            "license": 'license' in readme_content.lower(),
            "badges": readme_content.count('![') > 0 or readme_content.count('[![') > 0
        }

        return {
            "length": len(readme_content),
            "line_count": len(lines),
            "header_count": len(headers),
            "sections": sections,
            "has_code_blocks": '```' in readme_content,
            "word_count": len(readme_content.split())
        }

    def analyze_file_structure(self, tree: Dict) -> Dict:
        """Analyze repository file structure"""
        if not tree or 'tree' not in tree:
            return {"file_count": 0, "directory_count": 0, "file_types": {}}

        files = tree['tree']
        file_count = sum(1 for f in files if f['type'] == 'blob')
        dir_count = sum(1 for f in files if f['type'] == 'tree')
        
        # Analyze file types
        file_types = Counter()
        for file in files:
            if file['type'] == 'blob':
                path = file['path']
                if '.' in path:
                    ext = path.split('.')[-1].lower()
                    file_types[ext] += 1

        return {
            "file_count": file_count,
            "directory_count": dir_count,
            "file_types": dict(file_types.most_common(10)),
            "total_size": tree.get('size', 0)
        }
