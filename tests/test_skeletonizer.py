import unittest
import os
from backend.analyzer.skeletonizer import skeletonize
from backend.analyzer.file_extractor import extract_files, MAX_FILE_SIZE

class TestSkeletonizer(unittest.TestCase):
    def test_python_skeleton(self):
        content = """
import os
import sys

class LargeClass:
    def __init__(self):
        self.data = []
        # Many lines of logic...
        pass
        
    def process_data(self, item):
        \"\"\"Docs here.\"\"\"
        if item:
            return True
        return False

def standalone_func(a, b):
    return a + b
"""
        skeleton = skeletonize(content, "test.py")
        self.assertIn("class LargeClass:", skeleton)
        self.assertIn("def __init__(self):", skeleton)
        self.assertIn("def process_data(self, item):", skeleton)
        self.assertIn("def standalone_func(a, b):", skeleton)
        self.assertIn("import os", skeleton)
        self.assertNotIn("self.data = []", skeleton)

    def test_javascript_skeleton(self):
        content = """
import React from 'react';

export const MyComponent = ({ data }) => {
    const [state, setState] = useState(null);
    
    useEffect(() => {
        // complex logic
    }, []);
    
    return <div>{data}</div>;
};

export default class MyClass extends React.Component {
    render() {
        return <h1>Hello</h1>;
    }
}
"""
        skeleton = skeletonize(content, "test.tsx")
        self.assertIn("export const MyComponent = ({ data }) =>", skeleton)
        self.assertIn("export default class MyClass extends React.Component", skeleton)
        self.assertIn("import React from 'react';", skeleton)
        self.assertNotIn("useState(null)", skeleton)

if __name__ == "__main__":
    unittest.main()
