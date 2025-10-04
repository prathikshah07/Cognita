import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PomodoroTimer = () => {
  const { toast } = useToast();

  // Configurable durations
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Timer state
  const [minutes, setMinutes] = useState(focusMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Timer logic
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
                description: `Time for a ${breakMinutes}-minute break.`,
              });
              setIsBreak(true);
              setMinutes(breakMinutes);
              setSeconds(0);
            } else {
              toast({
                title: "Break Complete!",
                description: `Ready for another session?`,
              });
              setIsBreak(false);
              setMinutes(focusMinutes);
              setSeconds(0);
            }
          } else {
            setMinutes((prev) => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prev) => prev - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak, toast, focusMinutes, breakMinutes]);

  // Controls
  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(focusMinutes);
    setSeconds(0);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Pomodoro Timer</h3>

      {/* Duration Inputs */}
      <div className="flex gap-4 justify-center mb-4">
        <div>
          <label className="text-sm">Focus (min)</label>
          <input
            type="number"
            min={1}
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(Number(e.target.value))}
            className="w-16 text-center rounded border px-2 py-1"
            disabled={isActive}
          />
        </div>
        <div>
          <label className="text-sm">Break (min)</label>
          <input
            type="number"
            min={1}
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))}
            className="w-16 text-center rounded border px-2 py-1"
            disabled={isActive}
          />
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center">
        <div
          className={`text-5xl font-bold mb-6 ${
            isBreak ? "text-success" : "text-primary"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          {isBreak ? "Break Time" : "Focus Time"}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button onClick={toggleTimer} size="lg">
            {isActive ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isActive ? "Pause" : "Start"}
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
