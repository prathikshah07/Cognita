import { Hero } from '@/components/layout/Hero';

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background/60 to-background">
      <Hero quote={<span>“Design is intelligence made visible.”</span>} />
    </div>
  );
}
