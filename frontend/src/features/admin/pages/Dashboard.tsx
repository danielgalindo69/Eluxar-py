import { useState, useEffect } from "react";
import { DollarSign, BarChart3, Package, Users, AlertTriangle, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { adminDashboardAPI, formatPrice } from "../../../core/api/api";

// ─── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-white/5" />
      <div className="w-16 h-5 bg-[#F5F5F5] dark:bg-white/5 rounded-sm" />
    </div>
    <div className="h-8 w-2/3 bg-[#F5F5F5] dark:bg-white/5 rounded-sm mb-2" />
    <div className="h-3 w-1/2 bg-[#F5F5F5] dark:bg-white/5 rounded-sm" />
  </div>
);

const SkeletonChart = ({ height = 300 }: { height?: number }) => (
  <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-6 animate-pulse">
    <div className="h-4 w-40 bg-[#F5F5F5] dark:bg-white/5 rounded-sm mb-6" />
    <div className={`w-full bg-[#F5F5F5] dark:bg-white/5 rounded-sm`} style={{ height }} />
  </div>
);

// ─── Tooltip personalizado ────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] dark:bg-[var(--bg-surface)] border border-white/10 px-4 py-3 text-white text-xs">
        <p className="uppercase tracking-widest text-white/50 mb-1">{label}</p>
        <p className="font-bold">{typeof payload[0].value === 'number' && payload[0].value > 999
          ? `$${formatPrice(payload[0].value)} COP`
          : payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminDashboardAPI.getMetrics()
      .then(setMetrics)
      .catch(() => setError("No se pudieron cargar las métricas. Verifica la conexión con el servidor."))
      .finally(() => setIsLoading(false));
  }, []);

  const statCards = metrics ? [
    {
      label: "Ingresos Totales",
      value: `$${formatPrice(metrics.ingresosTotales)} COP`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-[#A5BAA8]",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Usuarios Totales",
      value: metrics.totalUsuarios,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Pedidos Entregados",
      value: metrics.pedidosEntregados,
      icon: Package,
      color: "text-[#3A4A3F] dark:text-[#A5BAA8]",
      bg: "bg-[#3A4A3F]/10 dark:bg-[#A5BAA8]/10",
    },
    {
      label: "Alertas de Stock",
      value: metrics.productosStockBajo,
      icon: AlertTriangle,
      color: metrics.productosStockBajo > 0 ? "text-red-500" : "text-[#3A4A3F] dark:text-[#A5BAA8]",
      bg: metrics.productosStockBajo > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-[#3A4A3F]/10",
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">
          Panel de Control
        </h1>
        <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-1">
          Datos en tiempo real del sistema Eluxar
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-6 hover:border-[#111111]/20 dark:hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-2 rounded-full ${stat.bg}`}>
                      <Icon size={18} strokeWidth={1.5} className={stat.color} />
                    </div>
                    <TrendingUp size={14} className="text-[#2B2B2B]/20 dark:text-white/20" />
                  </div>
                  <div className="text-2xl font-light text-[#111111] dark:text-white mb-1 truncate">
                    {stat.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/50 dark:text-white/40">
                    {stat.label}
                  </div>
                </div>
              );
            })}
      </div>

      {/* ── Gráficos ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Volumen de Ventas Mensuales */}
        {isLoading ? (
          <SkeletonChart height={280} />
        ) : (
          <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white flex items-center gap-2 mb-6">
              <BarChart3 size={15} /> Volumen de Ventas Mensuales
            </h2>
            {metrics?.ventasMensuales?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={metrics.ventasMensuales} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'rgba(128,128,128,0.6)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'rgba(128,128,128,0.6)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.05)' }} />
                  <Bar dataKey="total" name="Ventas (COP)" fill="#3A4A3F" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-[#2B2B2B]/30 dark:text-white/20 text-xs uppercase tracking-widest">
                Sin datos de ventas aún
              </div>
            )}
          </div>
        )}

        {/* Top 5 Productos Más Vendidos */}
        {isLoading ? (
          <SkeletonChart height={280} />
        ) : (
          <div className="bg-white dark:bg-[var(--bg-surface)] border border-[#EDEDED] dark:border-white/8 p-6">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#111111] dark:text-white flex items-center gap-2 mb-6">
              <Package size={15} /> Top 5 Productos Más Vendidos
            </h2>
            {metrics?.topProductos?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={metrics.topProductos}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: 'rgba(128,128,128,0.6)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'rgba(128,128,128,0.6)' }}
                    width={110}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.05)' }} />
                  <Bar dataKey="ventas" name="Unidades Vendidas" fill="#111111" radius={[0, 3, 3, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-[#2B2B2B]/30 dark:text-white/20 text-xs uppercase tracking-widest">
                Sin ventas registradas aún
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
