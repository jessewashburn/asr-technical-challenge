import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";

import type { RecordItem } from "@/app/interview/types";

interface RecordCardProps {
  record: RecordItem;
  onSelect: (record: RecordItem) => void;
}

/**
 * RecordCard presents a compact summary of a specimen including its name,
 * description, and current review status, alongside a Review action to open
 * the detail dialog. Status is rendered as a badge with a consistent visual
 * mapping to aid quick scanning in the grid.
 */
const statusToVariant: Record<
  RecordItem["status"],
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  pending: "secondary",
  approved: "default",
  flagged: "destructive",
  needs_revision: "destructive",
};

// Enhanced status badge colors
const statusBadgeClasses: Record<RecordItem["status"], string> = {
  pending: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  approved: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
  flagged: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
  needs_revision: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
};

export default function RecordCard({ record, onSelect }: RecordCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b pb-3">
        <div className="flex-1">
          <CardTitle className="text-base sm:text-lg tracking-tight font-semibold">
            {record.name}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">
            {record.description}
          </CardDescription>
        </div>
        <CardAction className="mt-2 sm:mt-0 sm:ml-3">
          <Badge className={`capitalize border ${statusBadgeClasses[record.status]}`}>
            {record.status.replace("_", " ")}
          </Badge>
        </CardAction>
      </CardHeader>
      {record.note && (
        <CardContent className="pt-3">
          <p className="text-xs sm:text-sm text-muted-foreground italic">
            "{record.note}"
          </p>
        </CardContent>
      )}
      <CardFooter className="border-t bg-muted/30 pt-3 flex justify-end">
        <Button 
          variant="default" 
          size="sm"
          onClick={() => onSelect(record)}
          className="font-medium"
        >
          Review
        </Button>
      </CardFooter>
    </Card>
  );
}
