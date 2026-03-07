interface ResultViewProps {
  result: string | null;
  loading: boolean;
}

export default function ResultView({ result, loading }: ResultViewProps) {
  if (loading) {
    return <div className="result-view loading">Analyzing repository...</div>;
  }

  if (!result) {
    return null;
  }

  return (
    <div className="result-view">
      <h2>Analysis Result</h2>
      <pre>{result}</pre>
    </div>
  );
}
