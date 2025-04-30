// TableLoader.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableLoader() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded animate-pulse w-1/4 mb-2"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/3"></div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableHead key={i}>
                  <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div
                      className="h-4 bg-muted rounded animate-pulse"
                      style={{
                        width: `${Math.floor(Math.random() * 50) + 50}%`,
                      }}
                    ></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
