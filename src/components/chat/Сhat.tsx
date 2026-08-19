import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function Chat() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <p className="text-2xl font-semibold">How can I help?</p>
        <p className="text-muted-foreground text-sm">
          Ask me to work with your ERP data.
        </p>
      </div>
      <div className="flex w-full items-center gap-2 border-t p-4">
        <Textarea placeholder="Ask your ERP assistant..." />
        <Button>Send</Button>
      </div>
    </div>
  );
}
