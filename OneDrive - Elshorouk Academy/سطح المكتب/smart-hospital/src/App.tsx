import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Truck, 
  Package, 
  BarChart3, 
  Settings,
  Bed,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ArrowRightLeft,
  UserCheck,
  UserMinus,
  ShoppingCart,
  Pill,
  Syringe,
  Stethoscope,
  ClipboardList,
  MapPin,
  PackageCheck,
  Calendar,
  BedDouble,
  UserCog,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  User,
  BellRing,
  Link,
  Shield,
  Save
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- Types ---
type KPICardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  statusColor: 'green' | 'yellow' | 'red' | 'blue';
};

type ActivityItem = {
  id: string;
  time: string;
  description: string;
  type: 'logistics' | 'patient' | 'system';
};

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  ward: string;
  status: 'Admitted' | 'Discharged' | 'Pending' | 'Critical';
  admissionDate: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: 'Medications' | 'Equipment' | 'Consumables';
  stock: number;
  capacity: number;
  unit: string;
  status: 'Optimal' | 'Low' | 'Critical';
};

type OrderStatus = 'Requested' | 'Approved' | 'Shipped' | 'Delivered';

type LogisticsOrder = {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  vendor: string;
  status: OrderStatus;
  requestDate: string;
  expectedDelivery: string;
};

type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

type HospitalBed = {
  id: string;
  ward: string;
  room: string;
  status: BedStatus;
  patientId?: string;
};

type StaffShift = {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'Support';
  department: string;
  time: string;
  status: 'On Duty' | 'Upcoming' | 'Completed';
};

// --- Mock Data (Fallbacks for other tabs) ---
const graphData = [
  { name: 'Mon', admissions: 45, discharges: 30 },
  { name: 'Tue', admissions: 52, discharges: 38 },
  { name: 'Wed', admissions: 48, discharges: 43 },
  { name: 'Thu', admissions: 61, discharges: 45 },
  { name: 'Fri', admissions: 59, discharges: 52 },
  { name: 'Sat', admissions: 35, discharges: 60 },
  { name: 'Sun', admissions: 40, discharges: 48 },
];

const activityFeedData: ActivityItem[] = [
  { id: '1', time: '10:14 AM', description: 'Nurse Sarah requested 50x IV Drip Kits.', type: 'logistics' },
  { id: '2', time: '09:45 AM', description: 'Patient #1042 successfully discharged from Ward B.', type: 'patient' },
  { id: '3', time: '09:12 AM', description: 'Low stock alert: Surgical Masks (below 15%).', type: 'system' },
  { id: '4', time: '08:30 AM', description: 'Vendor "MedSupply Co." confirmed delivery for tomorrow.', type: 'logistics' },
];

// We keep this as a fallback just in case the database is empty or offline
const fallbackPatientsData: Patient[] = [
  { id: 'PT-10042', name: 'Ahmed Hassan (Mock)', age: 45, gender: 'M', ward: 'Cardiology - Ward A', status: 'Admitted', admissionDate: '2026-04-01' },
];

const inventoryData: InventoryItem[] = [
  { id: 'INV-001', name: 'Paracetamol 500mg', category: 'Medications', stock: 4500, capacity: 5000, unit: 'Tablets', status: 'Optimal' },
  { id: 'INV-002', name: 'Surgical Masks (N95)', category: 'Consumables', stock: 120, capacity: 1000, unit: 'Boxes', status: 'Critical' },
  { id: 'INV-003', name: 'MRI Contrast Dye', category: 'Medications', stock: 45, capacity: 200, unit: 'Vials', status: 'Low' },
  { id: 'INV-004', name: 'Portable Defibrillator', category: 'Equipment', stock: 12, capacity: 15, unit: 'Units', status: 'Optimal' },
  { id: 'INV-005', name: 'IV Drip Kits', category: 'Consumables', stock: 85, capacity: 500, unit: 'Kits', status: 'Critical' },
  { id: 'INV-006', name: 'Amoxicillin 250mg', category: 'Medications', stock: 320, capacity: 1000, unit: 'Bottles', status: 'Low' },
];

const logisticsData: LogisticsOrder[] = [
  { id: 'ORD-8823', item: 'Surgical Masks (N95)', quantity: 500, unit: 'Boxes', vendor: 'MedSupply Co.', status: 'Shipped', requestDate: '2026-04-01', expectedDelivery: '2026-04-04' },
  { id: 'ORD-8824', item: 'IV Drip Kits', quantity: 300, unit: 'Kits', vendor: 'Global Health Inc.', status: 'Approved', requestDate: '2026-04-02', expectedDelivery: '2026-04-06' },
  { id: 'ORD-8825', item: 'Portable Defibrillator', quantity: 2, unit: 'Units', vendor: 'CardioTech Systems', status: 'Delivered', requestDate: '2026-03-28', expectedDelivery: '2026-04-02' },
  { id: 'ORD-8826', item: 'MRI Contrast Dye', quantity: 150, unit: 'Vials', vendor: 'PharmaCore Ltd.', status: 'Requested', requestDate: '2026-04-03', expectedDelivery: 'Pending Approval' },
];

const bedsData: HospitalBed[] = [
  { id: 'B-101', ward: 'Cardiology', room: '10A', status: 'Occupied', patientId: 'PT-10042' },
  { id: 'B-102', ward: 'Cardiology', room: '10A', status: 'Available' },
  { id: 'B-103', ward: 'Cardiology', room: '10B', status: 'Cleaning' },
  { id: 'B-201', ward: 'ICU', room: '20A', status: 'Occupied', patientId: 'PT-10044' },
  { id: 'B-202', ward: 'ICU', room: '20A', status: 'Maintenance' },
  { id: 'B-301', ward: 'Pediatrics', room: '30A', status: 'Available' },
  { id: 'B-302', ward: 'Pediatrics', room: '30B', status: 'Occupied', patientId: 'PT-10046' },
  { id: 'B-303', ward: 'Pediatrics', room: '30B', status: 'Available' },
];

const shiftsData: StaffShift[] = [
  { id: 'SH-01', name: 'Dr. Youssef Ali', role: 'Doctor', department: 'Cardiology', time: '08:00 AM - 04:00 PM', status: 'On Duty' },
  { id: 'SH-02', name: 'Nurse Fatima', role: 'Nurse', department: 'ICU', time: '08:00 AM - 04:00 PM', status: 'On Duty' },
  { id: 'SH-03', name: 'Dr. Mona Hassan', role: 'Doctor', department: 'Emergency', time: '04:00 PM - 12:00 AM', status: 'Upcoming' },
  { id: 'SH-04', name: 'Tech. Kareem', role: 'Support', department: 'Radiology', time: '12:00 AM - 08:00 AM', status: 'Completed' },
];

const financialData = [
  { name: 'Jan', costs: 45000, savings: 12000 },
  { name: 'Feb', costs: 42000, savings: 14000 },
  { name: 'Mar', costs: 38000, savings: 18000 },
  { name: 'Apr', costs: 35000, savings: 22000 },
  { name: 'May', costs: 32000, savings: 25000 },
  { name: 'Jun', costs: 29000, savings: 28000 },
];

const departmentUsageData = [
  { name: 'Cardiology', value: 35 },
  { name: 'ICU', value: 25 },
  { name: 'Pediatrics', value: 20 },
  { name: 'Emergency', value: 20 },
];
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

// --- Components ---

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, statusColor }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-600 border-amber-200',
    red: 'bg-rose-100 text-rose-600 border-rose-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colors[statusColor]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`text-sm font-medium ${
          trend.includes('+') ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {trend}
        </span>
        <span className="text-sm text-slate-500">vs last week</span>
      </div>
    </div>
  );
};

// --- Sub-Views ---

const DashboardView = () => (
  <div className="p-8 animate-in fade-in duration-300">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard title="Available Beds" value="142" icon={<Bed size={24} />} trend="+5.2%" statusColor="green" />
      <KPICard title="Active Patients" value="856" icon={<Users size={24} />} trend="+12.5%" statusColor="blue" />
      <KPICard title="Low Stock Alerts" value="14" icon={<AlertTriangle size={24} />} trend="+2.1%" statusColor="red" />
      <KPICard title="Pending Orders" value="28" icon={<Clock size={24} />} trend="-4.3%" statusColor="yellow" />
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">Patient Flow Analytics</h2>
        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none cursor-pointer">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey="admissions" name="Admissions" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="discharges" name="Discharges" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">Live Activity Feed</h2>
        <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="space-y-6">
        {activityFeedData.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                activity.type === 'logistics' ? 'bg-amber-100 text-amber-600' :
                activity.type === 'patient' ? 'bg-emerald-100 text-emerald-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                {activity.type === 'logistics' && <Truck size={18} />}
                {activity.type === 'patient' && <CheckCircle2 size={18} />}
                {activity.type === 'system' && <AlertTriangle size={18} />}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium text-slate-800">{activity.description}</p>
              <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PatientsView = () => {
  // --- LIVE DATABASE INTEGRATION STATE ---
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from our Node.js + SQL Server backend when this component loads
  useEffect(() => {
    fetch('http://localhost:5000/api/patients')
      .then((res) => res.json())
      .then((data) => {
        // Map the SQL database columns to our React component's expected properties
        const formattedData = data.map((p: any) => ({
          id: p.id,
          name: p.full_name, // Mapping full_name from SQL to name
          age: p.age,
          gender: p.gender,
          ward: p.ward,
          status: p.status,
          // Format SQL date safely
          admissionDate: p.admission_date ? new Date(p.admission_date).toISOString().split('T')[0] : 'Unknown'
        }));
        
        setPatientsList(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching live data:", error);
        // If the server is off, fallback to mock data so the UI doesn't break
        setPatientsList(fallbackPatientsData); 
        setIsLoading(false);
      });
  }, []);

  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'Admitted': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Admitted</span>;
      case 'Discharged': return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">Discharged</span>;
      case 'Pending': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Pending</span>;
      case 'Critical': return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">Critical</span>;
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Live data synced directly from Microsoft SQL Server.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={18} /> Add New Patient
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"/>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center">
              <RefreshCw className="animate-spin mb-4 text-blue-500" size={32} />
              <p>Fetching live database records...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Age/Gender</th>
                  <th className="px-6 py-4">Ward/Dept</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Admission Date</th>
                  <th className="px-6 py-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsList.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer hover:underline">{patient.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{patient.name}</td>
                    <td className="px-6 py-4">{patient.age} yrs • {patient.gender}</td>
                    <td className="px-6 py-4">{patient.ward}</td>
                    <td className="px-6 py-4">{getStatusBadge(patient.status)}</td>
                    <td className="px-6 py-4">{patient.admissionDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Admit" className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"><UserCheck size={18} /></button>
                        <button title="Transfer" className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><ArrowRightLeft size={18} /></button>
                        <button title="Discharge" className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"><UserMinus size={18} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 ml-1"><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const InventoryView = () => {
  const getCategoryIcon = (category: InventoryItem['category']) => {
    switch (category) {
      case 'Medications': return <Pill size={16} className="text-purple-500" />;
      case 'Equipment': return <Stethoscope size={16} className="text-blue-500" />;
      case 'Consumables': return <Syringe size={16} className="text-emerald-500" />;
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'Optimal': return 'bg-emerald-500';
      case 'Low': return 'bg-amber-500';
      case 'Critical': return 'bg-rose-500';
    }
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'Optimal': return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Optimal</span>;
      case 'Low': return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Low Stock</span>;
      case 'Critical': return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-semibold flex items-center gap-1"><AlertTriangle size={12}/> Critical</span>;
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory & Supplies</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor stock levels, track categories, and manage reorders.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
            <Filter size={18} /> Categories
          </button>
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {inventoryData.map((item) => {
          const percentage = Math.round((item.stock / item.capacity) * 100);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-start">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.id} • {item.category}</p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Stock Level</span>
                  <span className="text-slate-500">{item.stock} / {item.capacity} {item.unit}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getStatusColor(item.status)}`} style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">{percentage}% capacity</p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                <button className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
                  View Details
                </button>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.status === 'Critical' || item.status === 'Low' 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                  <ShoppingCart size={16} />
                  Auto-Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LogisticsView = () => {
  const orderSteps = ['Requested', 'Approved', 'Shipped', 'Delivered'];

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'Requested': return <ClipboardList size={18} />;
      case 'Approved': return <CheckCircle2 size={18} />;
      case 'Shipped': return <Truck size={18} />;
      case 'Delivered': return <PackageCheck size={18} />;
      default: return <ClipboardList size={18} />;
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Logistics & Tracking</h1>
          <p className="text-slate-500 text-sm mt-1">Live tracking of supply chain orders and vendor deliveries.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <MapPin size={18} /> View Map
        </button>
      </div>

      <div className="space-y-6">
        {logisticsData.map((order) => {
          const currentStepIndex = orderSteps.indexOf(order.status);
          
          return (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{order.item}</h3>
                    <p className="text-sm text-slate-500">Order {order.id} • {order.quantity} {order.unit}</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-medium text-slate-700">Vendor: <span className="font-normal text-slate-600">{order.vendor}</span></p>
                  <p className="text-sm font-medium text-slate-700 mt-1">Est. Delivery: <span className="font-normal text-blue-600">{order.expectedDelivery}</span></p>
                </div>
              </div>

              <div className="relative pt-2 pb-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0 hidden sm:block"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                  {orderSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step} className="flex flex-col items-center group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                          {getStepIcon(step)}
                        </div>
                        <p className={`text-sm font-medium mt-3 text-center ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step}</p>
                        {index === 0 && <p className="text-xs text-slate-400 mt-1">{order.requestDate}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-0 hidden sm:block transition-all duration-500" style={{ width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}></div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">View Invoice</button>
                {order.status === 'Requested' && <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">Approve Order</button>}
                {order.status === 'Shipped' && <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Track Shipment</button>}
                {order.status === 'Delivered' && <button className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors">Update Inventory</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OperationsView = () => {
  const getBedStatusColor = (status: BedStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Occupied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cleaning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Maintenance': return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const getShiftStatusBadge = (status: StaffShift['status']) => {
    switch (status) {
      case 'On Duty': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">On Duty</span>;
      case 'Upcoming': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Upcoming</span>;
      case 'Completed': return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">Completed</span>;
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Facility Operations</h1>
          <p className="text-slate-500 text-sm mt-1">Manage bed availability and staff scheduling in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BedDouble size={20} className="text-blue-600" /> Bed Management
            </h2>
            <button className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <RefreshCw size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {bedsData.map((bed) => (
              <div key={bed.id} className={`p-4 rounded-xl border flex flex-col justify-between h-32 transition-all cursor-pointer hover:shadow-md ${getBedStatusColor(bed.status)}`}>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg">{bed.id}</span>
                  <Bed size={20} className="opacity-70" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate">{bed.ward}</p>
                  <div className="flex justify-between items-end mt-1">
                    <p className="text-xs opacity-80">{bed.status}</p>
                    {bed.patientId && <p className="text-xs font-bold">{bed.patientId}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> Shift Schedule
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:underline">Full Calendar</button>
          </div>

          <div className="space-y-4">
            {shiftsData.map((shift) => (
              <div key={shift.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                    <UserCog size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{shift.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{shift.role} • {shift.department}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getShiftStatusBadge(shift.status)}
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Clock size={12} /> {shift.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-2.5 border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Assign New Shift
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportsView = () => {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm mt-1">AI-powered demand predictions, cost reduction tracking, and exportable reports.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Download size={18} /> Export All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-emerald-100">YTD Cost Savings</h3>
            <div className="p-2 bg-white/20 rounded-lg"><TrendingDown size={20} /></div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">$119,000</p>
            <p className="text-sm text-emerald-100 mt-1 flex items-center gap-1">
              <TrendingUp size={14} className="rotate-180" /> 14.5% improvement vs last year
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-blue-100">Supply Waste Reduction</h3>
            <div className="p-2 bg-white/20 rounded-lg"><PackageCheck size={20} /></div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">22.4%</p>
            <p className="text-sm text-blue-100 mt-1">Due to smart auto-reordering</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-slate-300">AI Predictive Alert</h3>
            <div className="p-2 bg-white/10 rounded-lg text-amber-400"><AlertTriangle size={20} /></div>
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold">Flu Season Spike</p>
            <p className="text-sm text-slate-400 mt-1">Anticipated 30% increase in respiratory supplies needed next week.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Supply Costs vs Optimization Savings</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="costs" name="Total Costs ($)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Optimized Savings ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Resource Allocation</h2>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={departmentUsageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {departmentUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 w-full flex flex-wrap justify-center gap-x-4 gap-y-2">
              {departmentUsageData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" /> Generated System Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Report Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date Generated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Q1 2026 Financial Optimization Summary</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">PDF</span></td>
                <td className="px-6 py-4">April 1, 2026</td>
                <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 justify-end ml-auto"><Download size={14} /> Download</button></td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Monthly Inventory Waste Analysis</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">Excel</span></td>
                <td className="px-6 py-4">March 31, 2026</td>
                <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 justify-end ml-auto"><Download size={14} /> Download</button></td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">Staff Shift Efficiency Report</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">PDF</span></td>
                <td className="px-6 py-4">March 28, 2026</td>
                <td className="px-6 py-4 text-right"><button className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 justify-end ml-auto"><Download size={14} /> Download</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsView = () => {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, hospital preferences, and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <User size={20} className="text-blue-600" /> User Profile
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-blue-50">
                MO
              </div>
              <div>
                <button className="text-sm font-medium text-blue-600 hover:underline">Change Photo</button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" defaultValue="Moscow" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" defaultValue="admin@smartmed.os" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input type="text" defaultValue="Hospital Director / Admin" disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Shield size={20} className="text-blue-600" /> Security
            </h2>
            <div className="space-y-4">
              <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">Change Password</button>
              <button className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">Enable Two-Factor Auth (2FA)</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <BellRing size={20} className="text-blue-600" /> Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">Critical Stock Alerts</h4>
                  <p className="text-sm text-slate-500">Receive SMS when inventory drops below 10%.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-medium text-slate-800">New Patient Admissions</h4>
                  <p className="text-sm text-slate-500">App notifications for emergency ward admissions.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-800">Daily Report Summaries</h4>
                  <p className="text-sm text-slate-500">Email digest of operations at 8:00 AM.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Link size={20} className="text-blue-600" /> System Integrations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl flex items-start gap-4 hover:border-blue-300 transition-colors cursor-pointer bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">EHR System Sync</h4>
                  <p className="text-xs text-slate-500 mt-1">Connected to Epic Systems. Syncing patient records hourly.</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Connected</span>
                </div>
              </div>
              
              <div className="p-4 border border-slate-200 rounded-xl flex items-start gap-4 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <BedDouble size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">IoT Smart Beds</h4>
                  <p className="text-xs text-slate-500 mt-1">Connect hospital beds for live occupancy tracking.</p>
                  <button className="mt-2 text-xs font-medium text-blue-600 hover:underline">Configure Setup</button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Discard Changes</button>
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
              <Save size={16} /> Save Preferences
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---

export default function App() {
  const [activeTab, setActiveTab] = useState('Patients'); // Default to patients so you can see the new live data!

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { icon: <Users size={20} />, label: 'Patients' },
    { icon: <Activity size={20} />, label: 'Operations' },
    { icon: <Truck size={20} />, label: 'Logistics' },
    { icon: <Package size={20} />, label: 'Inventory' },
    { icon: <BarChart3 size={20} />, label: 'Reports' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shrink-0 transition-all z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Activity className="text-blue-500" size={28} />
          <span className="text-white font-bold text-lg tracking-wide">SmartMed OS</span>
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = activeTab === item.label;
              return (
                <li key={index}>
                  <button 
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-4 px-6 py-3 transition-colors text-left ${
                      isActive 
                        ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Settings pinned to bottom of nav */}
        <div className="mb-4">
          <button 
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center gap-4 px-6 py-3 transition-colors text-left ${
              activeTab === 'Settings'
                ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
              MO
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">Moscow</p>
              <p className="text-xs text-slate-500 truncate">Hospital Director</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-20 px-8 flex items-center justify-between shrink-0 z-10">
          <h1 className="text-xl font-bold text-slate-800 hidden md:block">
            {activeTab === 'Dashboard' ? 'Hospital Operations' : activeTab}
          </h1>
          
          <div className="flex items-center gap-6 ml-auto">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all w-48 lg:w-64 text-sm"
              />
            </div>
            <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          {activeTab === 'Dashboard' && <DashboardView />}
          {activeTab === 'Patients' && <PatientsView />}
          {activeTab === 'Operations' && <OperationsView />}
          {activeTab === 'Inventory' && <InventoryView />}
          {activeTab === 'Logistics' && <LogisticsView />}
          {activeTab === 'Reports' && <ReportsView />}
          {activeTab === 'Settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}