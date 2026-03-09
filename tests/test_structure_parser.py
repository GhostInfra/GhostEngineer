import os
import shutil
import tempfile
import unittest
from backend.analyzer.structure_parser import parse_structure

class TestStructureParser(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_basic_structure(self):
        # Create a mock repo structure
        os.makedirs(os.path.join(self.test_dir, "src"))
        os.makedirs(os.path.join(self.test_dir, "tests"))
        with open(os.path.join(self.test_dir, "README.md"), "w") as f:
            f.write("# Test Repo")
        with open(os.path.join(self.test_dir, "src", "main.py"), "w") as f:
            f.write("print('hello')")

        tree = parse_structure(self.test_dir)
        
        self.assertEqual(tree["name"], "root")
        self.assertEqual(len(tree["children"]), 3)
        
        # Check src directory
        src_node = next(c for c in tree["children"] if c["name"] == "src")
        self.assertEqual(src_node["type"], "directory")
        self.assertTrue(src_node["is_key"])
        self.assertEqual(src_node["children"][0]["name"], "main.py")

    def test_ignore_list(self):
        # Create directories that should be ignored
        os.makedirs(os.path.join(self.test_dir, ".git"))
        os.makedirs(os.path.join(self.test_dir, "node_modules"))
        os.makedirs(os.path.join(self.test_dir, "__pycache__"))
        with open(os.path.join(self.test_dir, "app.py"), "w") as f:
            f.write("import os")

        tree = parse_structure(self.test_dir)
        
        # Only app.py should be visible
        self.assertEqual(len(tree["children"]), 1)
        self.assertEqual(tree["children"][0]["name"], "app.py")

    def test_key_directory_identification(self):
        dirs = ["api", "controllers", "models", "routes", "services", "utils", "other"]
        for d in dirs:
            os.makedirs(os.path.join(self.test_dir, d))
        
        tree = parse_structure(self.test_dir)
        
        for child in tree["children"]:
            if child["name"] in ["api", "controllers", "models", "routes", "services", "utils"]:
                self.assertTrue(child["is_key"], f"{child['name']} should be identified as a key directory")
            elif child["name"] == "other":
                self.assertFalse(child["is_key"], "other should NOT be identified as a key directory")

    def test_max_depth(self):
        # Create a deep structure
        current = self.test_dir
        for i in range(10):
            current = os.path.join(current, f"depth_{i}")
            os.makedirs(current)
        
        # Parse with lower depth
        tree = parse_structure(self.test_dir, max_depth=3)
        
        # Traverse to depth 3
        d1 = tree["children"][0]
        d2 = d1["children"][0]
        d3 = d2["children"][0]
        
        # Depth 4 should show the max depth message
        d4 = d3["children"][0]
        self.assertIn("message", d4)
        self.assertEqual(d4["message"], "Max depth reached")

if __name__ == "__main__":
    unittest.main()
