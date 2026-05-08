import { useState, useEffect } from "react";
import { DollarSign, BarChart3, Target, Users, TrendingUp, TrendingDown, Package, Activity } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { useTheme } from "next-themes";
import { adminDashboardAPI, formatPrice } from "../../../core/api/api";

const progressData = [
  { month: 'Ene', usuarios: 420, activos: 310, ventas: 3200 },
  { month: 'Feb', usuarios: 510, activos: 390, ventas: 4100 },
  { month: 'Mar', usuarios: 480, activos: 380, ventas: 3800 },
  { month: 'Abr', usuarios: 620, activos: 490, ventas: 5200 },
  { month: 'May', usuarios: 590, activos: 470, ventas: 4800 },
  { month: 'Jun', usuarios: 710, activos: 580, ventas: 6100 },
  { month: 'Jul', usuarios: 680, activos: 550, ventas: 5600 },
  { month: 'Ago', usuarios: 640, activos: 520, ventas: 4900 },
  { month: 'Sep', usuarios: 820, activos: 690, ventas: 7200 },
  { month: 'Oct', usuarios: 790, activos: 670, ventas: 6800 },
  { month: 'Nov', usuarios: 910, activos: 780, ventas: 8100 },
  { month: 'Dic', usuarios: 1050, activos: 920, ventas: 9500 },
];

const topProducts = [
  { name: 'Black Amber', ventas: 142 }, { name: 'Oud Marine', ventas: 128 },
  { name: 'Santal & Bergamot', ventas: 114 }, { name: 'Iris Concrete', ventas: 89 },
  { name: 'Rose Noir', ventas: 76 },
];

const conversionData = [
  { name: 'Visitas', value: 82 }, { name: 'Conversión', value: 18 },
];

const CHART_COLORS = ['#3A4A3F', '#A5BAA8'];

export const Dashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminDashboardAPI.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching dashboard metrics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const stats = [
    { label: "Ingresos Totales", value: metrics ? `$${formatPrice(metrics.ingresosTotales)} COP` : "$0", change: "+17.2%", isPositive: true, icon: DollarSign },
    { label: "Usuarios Totales", value: metrics ? metrics.totalUsuarios : "0", change: "+14.5%", isPositive: true, icon: Users },
    { label: "Pedidos Entregados", value: metrics ? metrics.pedidosEntregados : "0", change: "-2.4%", isPositive: false, icon: Package },
    { label: "Stock Bajo (Alertas)", value: metrics ? metrics.productosStockBajo : "0", change: "+1.1%", isPositive: false, icon: Target },
  ];

  // Shared tooltip style for dark mode compatibility
  const tooltipStyle = {
    fontSize: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 0,
    boxShadow: 'none',
    background: '#1a1a1a',
    color: '#fff',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Business Intelligence</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Métricas de crecimiento y progreso del sistema</p>
        </div>
        <select className="bg-white dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-4 py-2 text-sm outline-none w-fit">
          <option>Últimos 12 meses</option>
          <option>Últimos 6 meses</option>
          <option>Este año</option>
        </select>
      </div>

      {/* Stats Grid con Indicadores de Crecimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6 transition-all hover:border-[#111111]/20 dark:hover:border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#EDEDED]/50 dark:bg-white/5 rounded-full text-[#3A4A3F] dark:text-[#A5BAA8]">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2 py-1 ${
                  stat.isPositive ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-light text-[#111111] dark:text-white mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Gráficos de Progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Progreso de Usuarios (Líneas) */}
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2">
              <Activity size={16} /> Crecimiento de Usuarios
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              <Line type="monotone" name="Total Usuarios" dataKey="usuarios" stroke={isDark ? "#ffffff" : "#111111"} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Usuarios Activos" dataKey="activos" stroke="#3A4A3F" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Progreso de Ventas (Área + Barras conceptual) */}
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2">
              <BarChart3 size={16} /> Volumen de Ventas vs Meta
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              <Bar name="Ventas (COP)" dataKey="ventas" fill="#3A4A3F" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
          <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2 mb-6"><BarChart3 size={16} /> Productos Más Vendidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="ventas" fill={isDark ? "#ffffff" : "#111111"} radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6 flex flex-col items-center justify-center">
          <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2 mb-2 w-full"><Target size={16} /> Embudo de Ventas</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={conversionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                {conversionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <p className="text-3xl font-light text-[#3A4A3F] dark:text-[#A5BAA8]">18%</p>
            <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/30 mt-1">Tasa de Conversión Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};
