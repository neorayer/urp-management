import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi } from '@/services/userService';
import { UserStatus } from '@/types';
import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<UserStatus | undefined>();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['users', query, status, page],
    queryFn: () => userApi.searchUsers({ query, status, page, size: 20 }),
  });

  const getStatusBadge = (status: UserStatus) => {
    const colors: Record<UserStatus, string> = {
      [UserStatus.ACTIVE]: 'bg-green-100 text-green-700',
      [UserStatus.INACTIVE]: 'bg-muted text-muted-foreground',
      [UserStatus.SUSPENDED]: 'bg-amber-100 text-amber-700',
      [UserStatus.BANNED]: 'bg-red-100 text-red-700',
      [UserStatus.PENDING_VERIFICATION]: 'bg-blue-100 text-blue-700',
    };

    return (
      <Badge
        variant="outline"
        className={cn('capitalize border-0', colors[status])}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Directory</p>
          <h1 className="text-3xl font-semibold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions.</p>
        </div>
        <Button asChild>
          <Link to="/users/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add User
          </Link>
        </Button>
      </div>

      <Card className="border border-border/70">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-muted-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={status || 'all'}
              onValueChange={(value) => setStatus(value === 'all' ? undefined : (value as UserStatus))}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.values(UserStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="secondary" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="text-center border border-border/70 py-12">
          <p className="text-muted-foreground">Loading users...</p>
        </Card>
      ) : (
        <>
          <Card className="border border-border/70">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.content.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {user.displayName?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.displayName || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {user.roles.length} role(s)
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <Button variant="ghost" className="h-auto px-0 text-primary" asChild>
                          <Link to={`/users/${user.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {data && !data.last && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                className="mt-4"
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
