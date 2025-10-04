import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Trash2 } from 'lucide-react';

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  date: string;
  notes?: string;
}

interface StudyListProps {
  sessions: StudySession[];
  onDelete?: (id: string) => void;
}

export const StudyList = ({ sessions, onDelete }: StudyListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Study Sessions</h3>
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No study sessions yet</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{session.subject}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDuration(session.duration)} • {formatDate(session.date)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-primary">
                  {formatDuration(session.duration)}
                </div>
                
                {onDelete && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};