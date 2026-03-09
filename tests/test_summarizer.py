import unittest
from unittest.mock import MagicMock, patch
from backend.ai_engine.summarizer import summarize_repo

class TestSummarizer(unittest.TestCase):
    @patch('google.generativeai.GenerativeModel')
    def test_summarize_repo_success(self, mock_model_class):
        # Setup mock model and response
        mock_model = MagicMock()
        mock_model_class.return_value = mock_model
        
        mock_response = MagicMock()
        mock_response.text = "# Mock Summary\nThis is a test summary."
        mock_model.generate_content.return_value = mock_response

        # Sample data
        structure = {"name": "root", "type": "directory", "children": []}
        file_contents = [{"path": "README.md", "content": "# Hello"}]

        # We need to manually inject the mock model because it's initialized at module level
        import backend.ai_engine.summarizer as summarizer
        summarizer.llm_model = mock_model

        result = summarize_repo(structure, file_contents)
        
        self.assertEqual(result, "# Mock Summary\nThis is a test summary.")
        mock_model.generate_content.assert_called_once()

    def test_summarize_repo_no_model(self):
        import backend.ai_engine.summarizer as summarizer
        summarizer.llm_model = None
        
        result = summarize_repo({}, [])
        self.assertIn("AI Summarization is disabled", result)

if __name__ == "__main__":
    unittest.main()
