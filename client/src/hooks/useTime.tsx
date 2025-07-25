import { timeApi } from "@/lib/api";
import { useOrganization } from "@/providers/OrganizationProvider";
import type { ProjectWithTasks, Tag, TimeEntry } from "@/types/project";
import { useState } from "react";
import { toast } from "sonner";

const useTime = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { setRunningTimer } = useOrganization();
  const [projectsWithTasks, setProjectsWithTasks] = useState<
    ProjectWithTasks[]
  >([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [getTimeEntriesLoading, setGetTimeEntriesLoading] =
    useState<boolean>(false);
  const [getAllProjectsWithTasksLoading, setGetAllProjectsWithTasksLoading] =
    useState<boolean>(false);
  const [startTimerLoading, setStartTimerLoading] = useState<boolean>(false);
  const [stopTimerLoading, setStopTimerLoading] = useState<boolean>(false);
  const [createTimeEntryLoading, setCreateTimeEntryLoading] =
    useState<boolean>(false);
  const [updateTimeEntryLoading, setUpdateTimeEntryLoading] =
    useState<boolean>(false);
  const [deleteTimeEntryLoading, setDeleteTimeEntryLoading] =
    useState<boolean>(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState<boolean>(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState<boolean>(false);
  const [tagLoading, setTagLoading] = useState<boolean>(false);

  const [timeEntriesPagination, setTimeEntriesPagination] = useState<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const getRunningTimer = async (organizationId: string) => {
    try {
      setIsLoading(true);
      const response = await timeApi.getRunningTimer(organizationId);
      setRunningTimer(response.timer || null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch running timer";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTags = async (organizationId: string) => {
    try {
      setTagLoading(true);

      const response = await timeApi.getTags(organizationId);

      setTags(response.tags || []);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch tags";
      toast.error(errorMessage);
    } finally {
      setTagLoading(false);
    }
  };

  const getTimeEntries = async (
    organizationId: string,
    params?: { page?: number; limit?: number; date?: string }
  ) => {
    try {
      setGetTimeEntriesLoading(true);
      const response = await timeApi.getTimeEntries(organizationId, params);
      setTimeEntries(response.data || []);
      setTimeEntriesPagination(response.pagination || null);

      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch time entries";
      toast.error(errorMessage);
    } finally {
      setGetTimeEntriesLoading(false);
    }
  };

  const getAllProjectsWithTasks = async (organizationId: string) => {
    try {
      setGetAllProjectsWithTasksLoading(true);
      const response = await timeApi.getAllProjectWithTasks(organizationId);
      setProjectsWithTasks(response.data || []);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch projects with tasks";
      toast.error(errorMessage);
    } finally {
      setGetAllProjectsWithTasksLoading(false);
    }
  };

  const startTimer = async (
    organizationId: string,
    data: {
      description?: string;
      projectId?: string;
      taskId?: string;
      clientId?: string;
      billable?: boolean;
      tagIds?: string[];
    }
  ) => {
    try {
      setStartTimerLoading(true);
      const response = await timeApi.startTimer(organizationId, data);
      setRunningTimer(response.data);
      toast.success("Timer started successfully");
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to start timer";
      toast.error(errorMessage);
    } finally {
      setStartTimerLoading(false);
    }
  };

  const stopTimer = async (
    organizationId: string,
    timeEntryId: string,
    selectedDate: Date
  ) => {
    try {
      setStopTimerLoading(true);
      const response = await timeApi.stopTimer(organizationId, timeEntryId);
      setRunningTimer(null);

      const newEntry = response.data;

      const entryDate = new Date(newEntry.start);
      const selected = new Date(selectedDate);
      const isSameDate = entryDate.toDateString() === selected.toDateString();
      if (isSameDate) {
        setTimeEntries((prev) => [response.data, ...prev]);

        setTimeEntriesPagination((prev) => {
          if (!prev) return null;
          const newTotal = prev.total + 1;
          return {
            ...prev,
            total: newTotal,
            totalPages: Math.ceil(newTotal / prev.pageSize),
          };
        });
      }

      toast.success("Timer stopped successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to stop timer";
      toast.error(errorMessage);
    } finally {
      setStopTimerLoading(false);
    }
  };

  const createTimeEntry = async (
    organizationId: string,
    data: {
      description?: string;
      start: Date;
      end: Date;
      projectId?: string;
      taskId?: string;
      billable: boolean;
      tagIds?: string[];
    },
    selectedDate: Date
  ) => {
    try {
      setCreateTimeEntryLoading(true);
      const response = await timeApi.createTimeEntry(organizationId, data);

      const newEntry = response.data;

      const entryDate = new Date(newEntry.start);
      const selected = new Date(selectedDate);
      const isSameDate = entryDate.toDateString() === selected.toDateString();

      if (isSameDate) {
        setTimeEntries((prev) => [newEntry, ...prev]);

        setTimeEntriesPagination((prev) => {
          if (!prev) return null;
          const newTotal = prev.total + 1;
          return {
            ...prev,
            total: newTotal,
            totalPages: Math.ceil(newTotal / prev.pageSize),
          };
        });
      }

      toast.success("Time entry created successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create time entry";
      toast.error(errorMessage);
    } finally {
      setCreateTimeEntryLoading(false);
    }
  };

  const updateTimeEntry = async (
    organizationId: string,
    timeEntryId: string,
    data: {
      description?: string;
      start: Date;
      end: Date;
      projectId?: string;
      taskId?: string;
      billable: boolean;
      tagIds?: string[];
    }
  ) => {
    try {
      setUpdateTimeEntryLoading(true);
      const response = await timeApi.updateTimeEntry(
        organizationId,
        timeEntryId,
        data
      );

      setTimeEntries((prev) =>
        prev.map((entry) => (entry.id === timeEntryId ? response.data : entry))
      );

      toast.success("Time entry updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update time entry";
      toast.error(errorMessage);
    } finally {
      setUpdateTimeEntryLoading(false);
    }
  };

  const deleteTimeEntry = async (
    organizationId: string,
    timeEntryId: string
  ) => {
    try {
      setDeleteTimeEntryLoading(true);
      const response = await timeApi.deleteTimeEntry(
        organizationId,
        timeEntryId
      );

      setTimeEntries((prev) =>
        prev.filter((entry) => entry.id !== timeEntryId)
      );

      setTimeEntriesPagination((prev) => {
        if (!prev) return null;
        const newTotal = prev.total - 1;
        return {
          ...prev,
          total: newTotal,
          totalPages: Math.max(1, Math.ceil(newTotal / prev.pageSize)),
        };
      });

      toast.success("Time entry deleted successfully");
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete time entry";
      toast.error(errorMessage);
    } finally {
      setDeleteTimeEntryLoading(false);
    }
  };

  const bulkUpdateTimeEntries = async (
    organizationId: string,
    data: {
      timeEntryIds: string[];
      updates: {
        description?: string;
        projectId?: string;
        taskId?: string;
        billable: boolean;
        tagIds?: string[];
      };
    }
  ) => {
    try {
      setBulkUpdateLoading(true);
      const response = await timeApi.bulkUpdateTimeEntries(
        organizationId,
        data
      );

      setTimeEntries((prev) =>
        prev.map((entry) =>
          data.timeEntryIds.includes(entry.id)
            ? { ...entry, ...data.updates }
            : entry
        )
      );

      toast.success("Time entries updated successfully");
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update time entries";
      toast.error(errorMessage);
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const bulkDeleteTimeEntries = async (
    organizationId: string,
    timeEntryIds: string[]
  ) => {
    try {
      setBulkDeleteLoading(true);
      const response = await timeApi.bulkDeleteTimeEntries(
        organizationId,
        timeEntryIds
      );

      setTimeEntries((prev) =>
        prev.filter((entry) => !timeEntryIds.includes(entry.id))
      );

      setTimeEntriesPagination((prev) => {
        if (!prev) return null;
        const newTotal = prev.total - timeEntryIds.length;
        return {
          ...prev,
          total: newTotal,
          totalPages: Math.max(1, Math.ceil(newTotal / prev.pageSize)),
        };
      });

      toast.success("Time entries deleted successfully");
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete time entries";
      toast.error(errorMessage);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return {
    timeEntries,
    tags,
    getTags,
    tagLoading,
    projectsWithTasks,
    isLoading,
    startTimerLoading,
    stopTimerLoading,
    createTimeEntryLoading,
    updateTimeEntryLoading,
    deleteTimeEntryLoading,
    bulkUpdateLoading,
    bulkDeleteLoading,
    timeEntriesPagination,
    getAllProjectsWithTasksLoading,
    getTimeEntriesLoading,
    getRunningTimer,
    getTimeEntries,
    getAllProjectsWithTasks,
    startTimer,
    stopTimer,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    bulkUpdateTimeEntries,
    bulkDeleteTimeEntries,
  };
};

export default useTime;
