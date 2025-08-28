import httpx
import base64
import os
from typing import Dict, List, Optional
from fastapi import HTTPException

class GitHubService:
    def __init__(self):
        self.api_url = "https://api.github.com"
        self.token = os.getenv('GITHUB_TOKEN')
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        } if self.token else {"Accept": "application/vnd.github.v3+json"}

    async def get_repository(self, owner: str, repo: str) -> Dict:
        """Get basic repository information"""
        url = f"{self.api_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Repository not found: {response.text}"
                )
            return response.json()

    async def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Get programming languages used in repository"""
        url = f"{self.api_url}/repos/{owner}/{repo}/languages"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json() if response.status_code == 200 else {}

    async def get_commits(self, owner: str, repo: str, per_page: int = 100, page: int = 1) -> List[Dict]:
        """Get repository commits"""
        url = f"{self.api_url}/repos/{owner}/{repo}/commits"
        params = {"per_page": per_page, "page": page}
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch commits"
                )
            return response.json()

    async def get_readme(self, owner: str, repo: str) -> Optional[str]:
        """Get repository README content"""
        url = f"{self.api_url}/repos/{owner}/{repo}/readme"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code != 200:
                return None
            data = response.json()
            try:
                content = base64.b64decode(data['content']).decode('utf-8')
                return content
            except Exception:
                return None

    async def get_file_content(self, owner: str, repo: str, path: str) -> Optional[str]:
        url = f"{self.api_url}/repos/{owner}/{repo}/contents/{path}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code != 200:
                return None
            data = response.json()
            
            if 'content' in data and data['encoding'] == 'base64':
                try:
                    content = base64.b64decode(data['content']).decode('utf-8')
                    return content
                except UnicodeDecodeError:
                    # Handle binary files
                    return f"[Binary file - {data.get('size', 0)} bytes]"
            return None


    async def get_contributors(self, owner: str, repo: str) -> List[Dict]:
        """Get repository contributors"""
        url = f"{self.api_url}/repos/{owner}/{repo}/contributors"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json() if response.status_code == 200 else []

    async def get_issues(self, owner: str, repo: str, state: str = "all") -> List[Dict]:
        """Get repository issues"""
        url = f"{self.api_url}/repos/{owner}/{repo}/issues"
        params = {"state": state, "per_page": 100}
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            return response.json() if response.status_code == 200 else []

    async def get_tree(self, owner: str, repo: str, sha: str = "HEAD") -> Dict:
        """Get repository file tree"""
        url = f"{self.api_url}/repos/{owner}/{repo}/git/trees/{sha}?recursive=1"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            return response.json() if response.status_code == 200 else {}
