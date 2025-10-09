"use client";

type Props = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  return (
    <div className="space-y-3 p-6">
      <h2 className="text-lg font-medium">Что-то пошло не так</h2>
      <pre className="text-sm opacity-70 whitespace-pre-wrap">
        {String(error?.message ?? "")}
      </pre>
      <button
        onClick={reset}
        className="px-3 py-1.5 rounded bg-foreground text-background"
      >
        Повторить
      </button>
    </div>
  );
}
