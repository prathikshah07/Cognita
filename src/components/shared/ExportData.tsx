import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportDataProps {
  data: any[];
  filename: string;
  label?: string;
}

export const ExportData = ({ data, filename, label = "Export Data" }: ExportDataProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Data exported successfully.",
    });
  };

  const exportToJSON = () => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive"
      });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Data exported successfully.",
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToCSV} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        {label} (CSV)
      </Button>
      <Button onClick={exportToJSON} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        {label} (JSON)
      </Button>
    </div>
  );
};
