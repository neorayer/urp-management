import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/services/auditService';
import { Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn: () => {
      const params: any = { page, size: 20 };
      if (filters.action) params.action = filters.action;
      if (filters.targetType) params.targetType = filters.targetType;
      return auditApi.searchAuditLogs(params);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Observability</p>
          <h1 className="text-3xl font-semibold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and changes.</p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="border border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-muted-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={filters.action || undefined}
            onValueChange={(value) => setFilters({ ...filters, action: value || '' })}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER_CREATED">User Created</SelectItem>
              <SelectItem value="USER_UPDATED">User Updated</SelectItem>
              <SelectItem value="USER_DELETED">User Deleted</SelectItem>
              <SelectItem value="ROLE_ASSIGNED">Role Assigned</SelectItem>
              <SelectItem value="ROLE_REMOVED">Role Removed</SelectItem>
              <SelectItem value="USER_LOGIN">User Login</SelectItem>
              <SelectItem value="USER_LOGOUT">User Logout</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.targetType || undefined}
            onValueChange={(value) => setFilters({ ...filters, targetType: value || '' })}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Target Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Role">Role</SelectItem>
              <SelectItem value="Permission">Permission</SelectItem>
              <SelectItem value="Session">Session</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="secondary" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="text-center border border-border/70 py-12">
          <p className="text-muted-foreground">Loading audit logs...</p>
        </Card>
      ) : (
        <>
          <Card className="border border-border/70">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.content.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-none">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.actorUserEmail || 'System'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.targetType && (
                          <span>
                            {log.targetType} #{log.targetId}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.ipAddress || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {data && !data.last && (
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setPage(page + 1)}
                variant="secondary"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
