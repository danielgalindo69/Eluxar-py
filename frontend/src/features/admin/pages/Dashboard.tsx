import React from "react";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, BarChart3, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const salesData = [
  { month: 'Ene', ventas: 3200 }, { month: 'Feb', ventas: 4100 }, { month: 'Mar', ventas: 3800 },
  { month: 'Abr', ventas: 5200 }, { month: 'May', ventas: 4800 }, { month: 'Jun', ventas: 6100 },
  { month: 'Jul', ventas: 5600 }, { month: 'Ago', ventas: 4900 }, { month: 'Sep', ventas: 7200 },
  { month: 'Oct', ventas: 6800 }, { month: 'Nov', ventas: 8100 }, { month: 'Dic', ventas: 9500 },
];

const topProducts = [
  { name: 'Black Amber', ventas: 142 }, { name: 'Oud Marine', ventas: 128 },
  { name: 'Santal & Bergamot', ventas: 114 }, { name: 'Iris Concrete', ventas: 89 },
  { name: 'Rose Noir', ventas: 76 },
];

const conversionData = [
  { name: 'Visitas', value: 82 }, { name: 'Conversión', value: 18 },
];

const CHART_COLORS = ['#3A4A3F', '#4A5568'];

export const Dashboard = () => {
  const stats: any[] = [];

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
          <h1 className="text-2xl font-light text-[#111111] dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#2B2B2B]/60 dark:text-white/40 mt-2">Resumen general del e-commerce</p>
        </div>
        <select className="bg-white dark:bg-[#1A1A1A] border border-[#EDEDED] dark:border-white/10 text-[#111111] dark:text-white px-4 py-2 text-sm outline-none w-fit">
          <option>Últimos 30 días</option>
          <option>Últimos 7 días</option>
          <option>Este mes</option>
          <option>Este año</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon size={24} className="text-[#3A4A3F]" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#3A4A3F]">{stat.change}</span>
              </div>
              <div className="text-3xl font-light text-[#111111] dark:text-white mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/60 dark:text-white/40">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2"><DollarSign size={16} /> Ventas Mensuales</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="ventas" stroke="#3A4A3F" fill="#3A4A3F" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
          <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2 mb-6"><Target size={16} /> Tasa de Conversión</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={conversionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {conversionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <p className="text-3xl font-light text-[#3A4A3F]">18%</p>
            <p className="text-[10px] uppercase tracking-widest text-[#2B2B2B]/40 dark:text-white/30 mt-1">Tasa de Conversión</p>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8 p-6">
          <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white flex items-center gap-2 mb-6"><BarChart3 size={16} /> Productos Más Vendidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} width={120} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="ventas" fill="#3A4A3F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-[#161616] border border-[#EDEDED] dark:border-white/8">
          <div className="border-b border-[#EDEDED] dark:border-white/8 px-6 py-4">
            <h2 className="text-sm uppercase tracking-widest font-bold text-[#111111] dark:text-white">Pedidos Recientes</h2>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDEDED] dark:border-white/8">
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 pb-4">ID</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 pb-4">Cliente</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 pb-4">Total</th>
                  <th className="text-left text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/60 dark:text-white/40 pb-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "#1247", client: "Ana García", total: "€185.00", status: "Enviado" },
                  { id: "#1246", client: "Carlos López", total: "€210.00", status: "Procesando" },
                  { id: "#1245", client: "María Torres", total: "€155.00", status: "Entregado" },
                  { id: "#1244", client: "Jorge Ruiz", total: "€195.00", status: "Enviado" },
                  { id: "#1243", client: "Laura Sanz", total: "€185.00", status: "Entregado" },
                ].map((order, index) => (
                  <tr key={index} className="border-b border-[#EDEDED] dark:border-white/8 last:border-0">
                    <td className="py-3 text-sm text-[#2B2B2B] dark:text-white/80">{order.id}</td>
                    <td className="py-3 text-sm text-[#2B2B2B] dark:text-white/80">{order.client}</td>
                    <td className="py-3 text-sm text-[#2B2B2B] dark:text-white/80">{order.total}</td>
                    <td className="py-3">
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${
                        order.status === "Entregado" ? "text-[#3A4A3F]" :
                        order.status === "Enviado" ? "text-blue-400" : "text-amber-400"
                      }`}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
