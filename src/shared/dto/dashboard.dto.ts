export interface DashboardResponseDTO {
  currentOccupancy: number;
  capacity: number;
  todayCheckins: number;
  monthlyRevenue: number;
  pendingFeesCount: number;
  pendingFeesAmount: number;
  activeStudents: number;
  revenue30d: Array<{ date: string; amount: number }>;
  attendance30d: Array<{ date: string; count: number }>;
  recentActivity: Array<{ action: string; entityType: string; createdAt: string }>;
  partialFailures: string[];
}

export function toDashboardResponseDTO(data: {
  currentOccupancy: number;
  capacity: number;
  todayCheckins: number;
  monthlyRevenue: number;
  pendingFeesCount: number;
  pendingFeesAmount: number;
  activeStudents: number;
  revenue30d: Array<{ date: string; amount: number }>;
  attendance30d: Array<{ date: string; count: number }>;
  recentActivity: Array<{ action: string; entityType: string; createdAt: string }>;
  partialFailures: string[];
}): DashboardResponseDTO {
  return data;
}