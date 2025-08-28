import json
import re
from typing import Dict, List, Optional

class DependencyService:
    
    async def analyze_dependencies(self, github_service, owner: str, repo: str) -> Dict:
        """Analyze project dependencies from various package managers"""
        dependencies = {
            "package_managers": [],
            "total_dependencies": 0,
            "dependencies": {},
            "dev_dependencies": {},
            "outdated_dependencies": []
        }

        # Check for different package manager files
        package_files = {
            "package.json": self._analyze_npm_dependencies,
            "requirements.txt": self._analyze_python_dependencies,
            "Pipfile": self._analyze_pipfile_dependencies,
            "pom.xml": self._analyze_maven_dependencies,
            "build.gradle": self._analyze_gradle_dependencies,
            "Gemfile": self._analyze_ruby_dependencies,
            "composer.json": self._analyze_composer_dependencies,
            "go.mod": self._analyze_go_dependencies
        }

        for filename, analyzer in package_files.items():
            content = await github_service.get_file_content(owner, repo, filename)
            if content:
                result = analyzer(content)
                if result:
                    dependencies["package_managers"].append(filename)
                    dependencies["dependencies"][filename] = result.get("dependencies", {})
                    if "dev_dependencies" in result:
                        dependencies["dev_dependencies"][filename] = result["dev_dependencies"]
                    dependencies["total_dependencies"] += len(result.get("dependencies", {}))

        return dependencies

    def _analyze_npm_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze package.json dependencies"""
        try:
            data = json.loads(content)
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})
            
            return {
                "dependencies": deps,
                "dev_dependencies": dev_deps,
                "scripts": data.get("scripts", {}),
                "version": data.get("version", "unknown")
            }
        except json.JSONDecodeError:
            return None

    def _analyze_python_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze requirements.txt dependencies"""
        lines = content.strip().split('\n')
        dependencies = {}
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                # Parse package==version or package>=version format
                match = re.match(r'^([a-zA-Z0-9\-_]+)([>=<!=]+)(.+)$', line)
                if match:
                    package, operator, version = match.groups()
                    dependencies[package] = f"{operator}{version}"
                else:
                    # Simple package name without version
                    dependencies[line] = "latest"
        
        return {"dependencies": dependencies} if dependencies else None

    def _analyze_pipfile_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze Pipfile dependencies"""
        # Simple parsing for [packages] and [dev-packages] sections
        dependencies = {}
        dev_dependencies = {}
        
        lines = content.split('\n')
        current_section = None
        
        for line in lines:
            line = line.strip()
            if line.startswith('[packages]'):
                current_section = 'packages'
            elif line.startswith('[dev-packages]'):
                current_section = 'dev-packages'
            elif line.startswith('['):
                current_section = None
            elif current_section and '=' in line:
                package, version = line.split('=', 1)
                package = package.strip()
                version = version.strip().strip('"')
                
                if current_section == 'packages':
                    dependencies[package] = version
                elif current_section == 'dev-packages':
                    dev_dependencies[package] = version
        
        return {
            "dependencies": dependencies,
            "dev_dependencies": dev_dependencies
        } if dependencies or dev_dependencies else None

    def _analyze_maven_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze Maven pom.xml dependencies"""
        dependencies = {}
        
        # Simple regex to find dependencies (this is basic, XML parsing would be better)
        dep_pattern = r'<dependency>.*?<groupId>(.*?)</groupId>.*?<artifactId>(.*?)</artifactId>.*?<version>(.*?)</version>.*?</dependency>'
        matches = re.findall(dep_pattern, content, re.DOTALL)
        
        for group_id, artifact_id, version in matches:
            package_name = f"{group_id}:{artifact_id}"
            dependencies[package_name] = version.strip()
        
        return {"dependencies": dependencies} if dependencies else None

    def _analyze_gradle_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze Gradle build.gradle dependencies"""
        dependencies = {}
        
        # Find implementation, compile, api dependencies
        dep_pattern = r'(?:implementation|compile|api)\s+[\'"]([^:]+):([^:]+):([^\'\"]+)[\'"]'
        matches = re.findall(dep_pattern, content)
        
        for group, name, version in matches:
            package_name = f"{group}:{name}"
            dependencies[package_name] = version
        
        return {"dependencies": dependencies} if dependencies else None

    def _analyze_ruby_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze Ruby Gemfile dependencies"""
        dependencies = {}
        
        # Find gem 'name', 'version' patterns
        gem_pattern = r'gem\s+[\'"]([^\'\"]+)[\'"](?:,\s*[\'"]([^\'\"]+)[\'"])?'
        matches = re.findall(gem_pattern, content)
        
        for name, version in matches:
            dependencies[name] = version if version else "latest"
        
        return {"dependencies": dependencies} if dependencies else None

    def _analyze_composer_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze PHP composer.json dependencies"""
        try:
            data = json.loads(content)
            deps = data.get("require", {})
            dev_deps = data.get("require-dev", {})
            
            return {
                "dependencies": deps,
                "dev_dependencies": dev_deps
            }
        except json.JSONDecodeError:
            return None

    def _analyze_go_dependencies(self, content: str) -> Optional[Dict]:
        """Analyze Go go.mod dependencies"""
        dependencies = {}
        
        lines = content.split('\n')
        in_require = False
        
        for line in lines:
            line = line.strip()
            if line.startswith('require ('):
                in_require = True
                continue
            elif line == ')' and in_require:
                in_require = False
                continue
            elif in_require or line.startswith('require '):
                # Parse "module version" format
                parts = line.replace('require ', '').split()
                if len(parts) >= 2:
                    module, version = parts, parts[1]
                    dependencies[module] = version
        
        return {"dependencies": dependencies} if dependencies else None
