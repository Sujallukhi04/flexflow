import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CircleCheckIcon,
  Inbox,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  MoreVertical,
} from "lucide-react";
import NoData from "@/components/NoData";
import type { Tasks } from "@/types/project";
import { getStatusBadge } from "../PaginationControl";
import { useState } from "react";
import { TasksSkeleton } from "../modals/Skeleton";

interface TasksTableProps {
  tasks?: Tasks[];
  isLoading?: boolean;
  onAddTask?: () => void;
  onEditTask?: (task: Tasks) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleStatus?: (taskId: string, currentStatus: "ACTIVE" | "DONE") => void;
  deleteLoading?: boolean;
  statusLoading?: boolean;
}

const TasksTable: React.FC<TasksTableProps> = ({
  tasks = [],
  isLoading = false,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  deleteLoading = false,
  statusLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"active" | "done">("active");

  const formatTimeInHours = (hours: number | null) => {
    if (!hours) return "--";
    return `${hours.toFixed(1)}h`;
  };

  const getProgressPercent = (
    spentTime: number | null,
    estimatedTime: number | null
  ) => {
    if (!spentTime || !estimatedTime || estimatedTime === 0) return 0;
    return Math.round((spentTime / estimatedTime) * 100);
  };

  // Filter tasks based on status
  const activeTasks = tasks.filter((task) => task.status === "ACTIVE");
  const doneTasks = tasks.filter((task) => task.status === "DONE");

  const renderTaskTable = (filteredTasks: Tasks[], emptyMessage: string) => (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-[25%]">Task Name</TableHead>
            <TableHead className="w-[20%]">Total Time</TableHead>
            <TableHead className="w-[25%]">Progress</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[10%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <NoData
                  icon={Inbox}
                  title={emptyMessage}
                  description="Tasks will appear here when available."
                />
              </TableCell>
            </TableRow>
          ) : (
            filteredTasks.map((task) => {
              const progressPercent = getProgressPercent(
                task.spentTime,
                task?.estimatedTime || 0
              );

              return (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{task.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {formatTimeInHours(task.spentTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {task.estimatedTime === null ? (
                        "--"
                      ) : (
                        <>
                          <div className="w-24 h-1.5 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${Math.min(progressPercent, 100)}%`,
                                background:
                                  progressPercent > 100 ? "#e53e3e" : "#38a169",
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progressPercent}% of{" "}
                            {formatTimeInHours(task?.estimatedTime || 0)}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(
                      task.status === "ACTIVE" ? "Active" : "Done"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          disabled={deleteLoading || statusLoading}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onToggleStatus?.(task.id, task.status)}
                          disabled={statusLoading}
                        >
                          {task.status === "ACTIVE" ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Done
                            </>
                          ) : (
                            <>
                              <Circle className="mr-2 h-4 w-4" />
                              Mark as Active
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditTask?.(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTask?.(task.id)}
                          className="text-red-500 hover:text-red-500 focus:text-red-500"
                          disabled={deleteLoading}
                        >
                          <Trash2 className="mr-2 size-4 text-red-500" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <CircleCheckIcon className="h-6 w-6 text-muted-foreground" />
              Tasks
            </h2>
          </div>

          <Button
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2"
            disabled
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        <TasksSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <CircleCheckIcon className="h-6 w-6 text-muted-foreground" />
            Tasks
          </h2>

          {/* Tabs moved here */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "active" | "done")}
          >
            <TabsList className="">
              <TabsTrigger value="active" className="flex items-center gap-2">
                Active
              </TabsTrigger>
              <TabsTrigger value="done" className="flex items-center gap-2">
                Done
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Add Task Button */}
        <Button
          variant="outline"
          className="w-full md:w-auto flex items-center gap-2"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Tab Content */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "active" | "done")}
      >
        <TabsContent value="active" className="mt-0">
          {renderTaskTable(activeTasks, "No active tasks")}
        </TabsContent>

        <TabsContent value="done" className="mt-0">
          {renderTaskTable(doneTasks, "No completed tasks")}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TasksTable;
