import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// HIRING CONTEXT - Shared State Bridge
// Connects HiringPlanner.tsx and RunwaySimulator.tsx
// ═══════════════════════════════════════════════════════════════════════════

export interface HireRole {
  id: string;
  title: string;
  salary: number;
  count: number;
  startMonth: number; // 1-24 (month when hire starts)
  color: string;
}

export interface HireEvent {
  month: number;
  roleId: string;
  roleTitle: string;
  count: number;
  salary: number;
  color: string;
  cumulativeImpact: number; // Total monthly impact at this point
}

export interface HiringImpact {
  totalMonthlyIncrease: number;  // Total payroll increase when all hires are active
  roles: HireRole[];
  hireEvents: HireEvent[];       // Timeline of when hires start
  getImpactAtMonth: (month: number) => number; // Time-aware impact calculator
}

interface HiringContextType {
  hiringImpact: HiringImpact;
  roles: HireRole[];
  updateRole: (id: string, updates: Partial<HireRole>) => void;
  setRoleCount: (id: string, count: number) => void;
  setRoleStartMonth: (id: string, startMonth: number) => void;
  setRoleSalary: (id: string, salary: number) => void;
  resetRoles: () => void;
  totalNewHires: number;
}

const DEFAULT_ROLES: HireRole[] = [
  { id: "eng", title: "Engineer", salary: 12000, count: 0, startMonth: 1, color: "hsl(226, 100%, 59%)" },
  { id: "sales", title: "Sales", salary: 8000, count: 0, startMonth: 1, color: "hsl(152, 100%, 50%)" },
  { id: "support", title: "Support", salary: 5000, count: 0, startMonth: 1, color: "hsl(45, 90%, 55%)" },
  { id: "ops", title: "Operations", salary: 7000, count: 0, startMonth: 1, color: "hsl(270, 60%, 55%)" },
];

const HiringContext = createContext<HiringContextType | undefined>(undefined);

export function HiringProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<HireRole[]>(DEFAULT_ROLES);

  // Update a role with partial updates
  const updateRole = useCallback((id: string, updates: Partial<HireRole>) => {
    setRoles(prev => prev.map(role => 
      role.id === id ? { ...role, ...updates } : role
    ));
  }, []);

  // Convenience methods
  const setRoleCount = useCallback((id: string, count: number) => {
    updateRole(id, { count: Math.max(0, count) });
  }, [updateRole]);

  const setRoleStartMonth = useCallback((id: string, startMonth: number) => {
    updateRole(id, { startMonth: Math.max(1, Math.min(24, startMonth)) });
  }, [updateRole]);

  const setRoleSalary = useCallback((id: string, salary: number) => {
    updateRole(id, { salary: Math.max(0, salary) });
  }, [updateRole]);

  const resetRoles = useCallback(() => {
    setRoles(DEFAULT_ROLES);
  }, []);

  // Total new hires across all roles
  const totalNewHires = useMemo(() => {
    return roles.reduce((sum, role) => sum + role.count, 0);
  }, [roles]);

  // Calculate hiring impact with temporal awareness
  const hiringImpact = useMemo((): HiringImpact => {
    // Total monthly increase when all hires are active
    const totalMonthlyIncrease = roles.reduce(
      (sum, role) => sum + (role.salary * role.count), 
      0
    );

    // Generate hire events (when each role's hires start)
    const hireEvents: HireEvent[] = [];
    let cumulativeImpact = 0;

    // Get unique start months and sort them
    const startMonths = [...new Set(roles.filter(r => r.count > 0).map(r => r.startMonth))].sort((a, b) => a - b);

    for (const month of startMonths) {
      const rolesStartingThisMonth = roles.filter(r => r.count > 0 && r.startMonth === month);
      
      for (const role of rolesStartingThisMonth) {
        const roleImpact = role.salary * role.count;
        cumulativeImpact += roleImpact;
        
        hireEvents.push({
          month,
          roleId: role.id,
          roleTitle: role.title,
          count: role.count,
          salary: role.salary,
          color: role.color,
          cumulativeImpact,
        });
      }
    }

    // Time-aware impact calculator
    // Returns the additional monthly expense at a given month
    const getImpactAtMonth = (month: number): number => {
      return roles.reduce((sum, role) => {
        // Only count if the month is >= startMonth
        if (role.count > 0 && month >= role.startMonth) {
          return sum + (role.salary * role.count);
        }
        return sum;
      }, 0);
    };

    return {
      totalMonthlyIncrease,
      roles,
      hireEvents,
      getImpactAtMonth,
    };
  }, [roles]);

  return (
    <HiringContext.Provider value={{
      hiringImpact,
      roles,
      updateRole,
      setRoleCount,
      setRoleStartMonth,
      setRoleSalary,
      resetRoles,
      totalNewHires,
    }}>
      {children}
    </HiringContext.Provider>
  );
}

export function useHiring() {
  const context = useContext(HiringContext);
  if (!context) {
    throw new Error("useHiring must be used within a HiringProvider");
  }
  return context;
}

// Optional hook for components that may or may not be within the provider
export function useHiringOptional() {
  return useContext(HiringContext);
}


