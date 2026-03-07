interface RepoInputProps {
  onSubmit: (repoUrl: string) => void;
}

export default function RepoInput({ onSubmit }: RepoInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get("repoUrl") as string;
    if (url) onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="repoUrl">GitHub Repository URL</label>
      <input
        id="repoUrl"
        name="repoUrl"
        type="url"
        placeholder="https://github.com/user/repo"
        required
      />
      <button type="submit">Analyze</button>
    </form>
  );
}
