import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PomodoroTimer = () => {
  const { toast } = useToast();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            if (!isBreak) {
              toast({
                title: "Pomodoro Complete!",
                description: "Time for a 5-minute break.",
              });
              setIsBreak(true);
              setMinutes(5);
            } else {
              toast({
                title: "Break Complete!",
                description: "Ready for another session?",
              });
              setIsBreak(false);
              setMinutes(25);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak, toast]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Pomodoro Timer</h3>
      <div className="text-center">
        <div className={`text-5xl font-bold mb-6 ${isBreak ? 'text-success' : 'text-primary'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={toggleTimer} size="lg">
            {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};
