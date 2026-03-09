import os
import shutil
import tempfile
import unittest
from backend.analyzer.file_extractor import extract_files

class TestFileExtractor(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_basic_extraction(self):
        # Create mock files
        with open(os.path.join(self.test_dir, "test.py"), "w") as f:
            f.write("print('hello')")
        with open(os.path.join(self.test_dir, "test.ts"), "w") as f:
            f.write("console.log('hi')")
        
        files = extract_files(self.test_dir)
        
        self.assertEqual(len(files), 2)
        paths = [f["path"] for f in files]
        self.assertIn("test.py", paths)
        self.assertIn("test.ts", paths)
        
        # Verify content
        py_file = next(f for f in files if f["path"] == "test.py")
        self.assertEqual(py_file["content"], "print('hello')")

    def test_ignore_dirs(self):
        # Create ignored directory
        node_modules = os.path.join(self.test_dir, "node_modules")
        os.makedirs(node_modules)
        with open(os.path.join(node_modules, "library.js"), "w") as f:
            f.write("alert('noise')")
            
        with open(os.path.join(self.test_dir, "app.js"), "w") as f:
            f.write("console.log('app')")
            
        files = extract_files(self.test_dir)
        
        # Should only find app.js
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0]["path"], "app.js")

    def test_extension_filter(self):
        with open(os.path.join(self.test_dir, "main.py"), "w") as f:
            f.write("python")
        with open(os.path.join(self.test_dir, "index.html"), "w") as f:
            f.write("html")
            
        # Filter only for .py
        files = extract_files(self.test_dir, extensions=['.py'])
        
        self.assertEqual(len(files), 1)
        self.assertEqual(files[0]["path"], "main.py")

    def test_size_limit(self):
        # Large file
        with open(os.path.join(self.test_dir, "large.txt"), "w") as f:
            f.write("X" * 1000)
            
        # Extract with 500 byte limit
        files = extract_files(self.test_dir, max_size=500)
        
        self.assertEqual(len(files), 0)
        
        # Extract with 2000 byte limit
        files = extract_files(self.test_dir, max_size=2000)
        self.assertEqual(len(files), 1)

if __name__ == "__main__":
    unittest.main()
