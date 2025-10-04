import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Clock, Trash2 } from 'lucide-react';

interface SleepRecord {
  id: string;
  date: string;
  hours: number;
  quality: number;
  notes?: string;
}

interface SleepListProps {
  records: SleepRecord[];
  onDelete?: (id: string) => void;
}

export const SleepList = ({ records, onDelete }: SleepListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-success';
    if (quality === 3) return 'text-warning';
    return 'text-destructive';
  };

  const getQualityText = (quality: number) => {
    if (quality === 5) return 'Excellent';
    if (quality === 4) return 'Very Good';
    if (quality === 3) return 'Good';
    if (quality === 2) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Sleep Records</h3>
      <div className="space-y-3">
        {records.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No sleep records yet</p>
        ) : (
          records.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Moon className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <div className="font-medium">{Number(record.hours)}h sleep</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(record.date)}
                  </div>
                  {record.notes && (
                    <div className="text-xs text-muted-foreground mt-1">{record.notes}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-sm font-medium ${getQualityColor(record.quality)}`}>
                    {getQualityText(record.quality)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Number(record.hours)}h
                  </div>
                </div>

                {onDelete && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(record.id)}>
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