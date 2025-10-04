import { ReactNode } from 'react';

export function Hero({ quote }: { quote?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-indigo-500/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-indigo-500/30 via-purple-600/20 to-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-80 w-[42rem] rounded-[40%] bg-gradient-to-tr from-fuchsia-500/20 via-purple-500/15 to-indigo-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-purple-300 via-fuchsia-200 to-indigo-200">
            Learn smarter with Cognita
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground/90">
            A unified dashboard for your notes, study sessions, sleep trends, and finances — now supercharged with AI.
          </p>

          {quote && (
            <blockquote className="mt-8 pl-4 border-l-2 border-purple-500/40 text-sm md:text-base text-foreground/90">
              {quote}
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}
