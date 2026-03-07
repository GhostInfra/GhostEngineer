import os
import shutil
import tempfile
import unittest
from backend.analyzer.repo_cloner import is_valid_github_url, clone_repo

class TestRepoCloner(unittest.TestCase):
    def test_url_validation_https(self):
        valid_urls = [
            "https://github.com/Rajkoli145/GhostEngineer",
            "http://github.com/octocat/Spoon-Knife",
            "https://github.com/facebook/react.git",
            "https://github.com/google/guava/",
        ]
        for url in valid_urls:
            with self.subTest(url=url):
                self.assertTrue(is_valid_github_url(url))

    def test_url_validation_ssh(self):
        valid_urls = [
            "git@github.com:Rajkoli145/GhostEngineer.git",
            "git@github.com:octocat/Spoon-Knife",
        ]
        for url in valid_urls:
            with self.subTest(url=url):
                self.assertTrue(is_valid_github_url(url))

    def test_url_validation_invalid(self):
        invalid_urls = [
            "https://google.com/Rajkoli145/GhostEngineer",
            "https://github.com/Rajkoli145",
            "github.com/Rajkoli145/GhostEngineer",
            "",
            None,
            "just string",
        ]
        for url in invalid_urls:
            with self.subTest(url=url):
                self.assertFalse(is_valid_github_url(url))

    def test_clone_success(self):
        # Using a tiny public repo for testing
        repo_url = "https://github.com/octocat/Spoon-Knife"
        with tempfile.TemporaryDirectory() as temp_dir:
            path = clone_repo(repo_url, temp_dir)
            self.assertTrue(os.path.exists(path))
            self.assertTrue(os.path.exists(os.path.join(path, "README.md")))
            self.assertTrue(os.path.exists(os.path.join(path, ".git")))

    def test_clone_invalid_url(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(ValueError):
                clone_repo("https://not-github.com/user/repo", temp_dir)

    def test_clone_non_existent(self):
        repo_url = "https://github.com/this-should-not-exist-at-all/404-repo"
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(RuntimeError):
                clone_repo(repo_url, temp_dir)

if __name__ == "__main__":
    unittest.main()
