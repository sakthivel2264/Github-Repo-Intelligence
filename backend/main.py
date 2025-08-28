from fastapi import FastAPI, HTTPException
from typing import Dict, Optional
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from services.github_service import GitHubService
from services.analysis_service import AnalysisService
from services.dependency_service import DependencyService

load_dotenv()

app = FastAPI(
    title="Git Repository Intelligence Hub",
    description="AI-powered repository analysis",
    version="1.0.0"
)
origin = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
github_service = GitHubService()
analysis_service = AnalysisService()
dependency_service = DependencyService()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Git Repository Intelligence Hub is running!"}

@app.get("/analyze/{owner}/{repo}")
async def analyze_repository(owner: str, repo: str) -> Dict:
    """
    Comprehensive repository analysis including:
    - Basic repository info and statistics
    - Language analysis and breakdown
    - Commit patterns and author statistics
    - Dependency analysis across multiple package managers
    - Code structure and README analysis
    """
    try:
        # Fetch basic repository data
        repo_data = await github_service.get_repository(owner, repo)
        languages = await github_service.get_languages(owner, repo)
        commits = await github_service.get_commits(owner, repo, per_page=100)
        readme = await github_service.get_readme(owner, repo)
        tree = await github_service.get_tree(owner, repo)
        
        # Perform analysis
        language_analysis = analysis_service.analyze_languages(languages)
        commit_analysis = analysis_service.analyze_commits(commits)
        readme_analysis = analysis_service.analyze_readme(readme)
        structure_analysis = analysis_service.analyze_file_structure(tree)
        dependency_analysis = await dependency_service.analyze_dependencies(
            github_service, owner, repo
        )

        return {
            "repository": {
                "name": repo_data.get('name'),
                "full_name": repo_data.get('full_name'),
                "description": repo_data.get('description'),
                "stars": repo_data.get('stargazers_count', 0),
                "forks": repo_data.get('forks_count', 0),
                "open_issues": repo_data.get('open_issues_count', 0),
                "watchers": repo_data.get('watchers_count', 0),
                "license": repo_data.get('license', {}).get('name') if repo_data.get('license') else None,
                "default_branch": repo_data.get('default_branch'),
                "created_at": repo_data.get('created_at'),
                "updated_at": repo_data.get('updated_at'),
                "size": repo_data.get('size', 0),
                "language": repo_data.get('language')
            },
            "languages": language_analysis,
            "commits": commit_analysis,
            "dependencies": dependency_analysis,
            "file_structure": structure_analysis,
            "readme_analysis": readme_analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/commit-analysis/{owner}/{repo}")
async def detailed_commit_analysis(owner: str, repo: str, limit: int = 200):
    """
    Detailed commit analysis with categorization and patterns
    """
    try:
        commits = await github_service.get_commits(owner, repo, per_page=limit)
        analysis = analysis_service.analyze_commits(commits)
        
        return {
            "repository": f"{owner}/{repo}",
            "analysis_date": "2025-08-28",
            "commit_analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Commit analysis failed: {str(e)}")

@app.get("/dependencies/{owner}/{repo}")
async def repository_dependencies(owner: str, repo: str):
    """
    Analyze repository dependencies across different package managers
    """
    try:
        dependencies = await dependency_service.analyze_dependencies(
            github_service, owner, repo
        )
        
        return {
            "repository": f"{owner}/{repo}",
            "dependency_analysis": dependencies
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dependency analysis failed: {str(e)}")

@app.get("/code-quality/{owner}/{repo}")
async def code_quality_analysis(owner: str, repo: str):
    """
    Basic code quality metrics and file analysis
    """
    try:
        tree = await github_service.get_tree(owner, repo)
        structure = analysis_service.analyze_file_structure(tree)
        
        # Basic quality metrics based on file structure
        quality_score = 0
        if structure['file_count'] > 0:
            # More files generally indicate better organization
            quality_score += min(structure['file_count'] / 50, 1) * 25
            
            # Diverse file types indicate good structure
            quality_score += min(len(structure['file_types']) / 5, 1) * 25
            
            # Documentation files boost score
            if any(ext in structure['file_types'] for ext in ['md', 'rst', 'txt']):
                quality_score += 20
                
            # Configuration files indicate good practices
            if any(ext in structure['file_types'] for ext in ['json', 'yml', 'yaml', 'toml']):
                quality_score += 15
                
            # Test files indicate quality
            if any(ext in structure['file_types'] for ext in ['test', 'spec']):
                quality_score += 15

        return {
            "repository": f"{owner}/{repo}",
            "file_structure": structure,
            "quality_metrics": {
                "overall_score": min(quality_score, 100),
                "file_diversity": len(structure['file_types']),
                "organization_score": min(structure['file_count'] / 50, 1) * 100
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code quality analysis failed: {str(e)}")

@app.get("/contributors/{owner}/{repo}")
async def repository_contributors(owner: str, repo: str):
    """
    Analyze repository contributors and their contributions
    """
    try:
        contributors = await github_service.get_contributors(owner, repo)
        
        return {
            "repository": f"{owner}/{repo}",
            "total_contributors": len(contributors),
            "contributors": contributors[:20]  # Top 20 contributors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Contributors analysis failed: {str(e)}")
    
@app.get("/tree/{owner}/{repo}")
async def get_repository_tree(owner: str, repo: str):
    """
    Get repository file tree structure
    """
    try:
        tree = await github_service.get_tree(owner, repo)
        
        if 'tree' in tree:
            # Format tree data for frontend
            formatted_tree = []
            for item in tree['tree']:
                formatted_tree.append({
                    'path': item['path'],
                    'type': item['type'],
                    'size': item.get('size')
                })
            
            return {
                "repository": f"{owner}/{repo}",
                "tree": formatted_tree[:500]  # Limit to 500 items for performance
            }
        else:
            return {"repository": f"{owner}/{repo}", "tree": []}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tree: {str(e)}")


@app.get("/file-content/{owner}/{repo}")
async def get_file_content(owner: str, repo: str, path: str):
    """Get specific file content from repository"""
    try:
        content = await github_service.get_file_content(owner, repo, path)
        if content:
            return {
                "repository": f"{owner}/{repo}",
                "path": path,
                "content": content,
                "size": len(content)
            }
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch file content: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )
