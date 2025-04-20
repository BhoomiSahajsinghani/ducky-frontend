import React from 'react';
import type {
  AreaChart as AreaChartType,
  Area as AreaType,
  XAxis as XAxisType,
  YAxis as YAxisType,
  CartesianGrid as CartesianGridType,
  Tooltip as TooltipType,
  ResponsiveContainer as ResponsiveContainerType,
  PieChart as PieChartType,
  Pie as PieType,
  Cell as CellType,
  BarChart as BarChartType,
  Bar as BarType,
} from 'recharts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';

// Mock data
const focusData = [
  { hour: '9AM', focused: 45, distracted: 15 },
  { hour: '10AM', focused: 50, distracted: 10 },
  { hour: '11AM', focused: 35, distracted: 25 },
  { hour: '12PM', focused: 30, distracted: 30 },
  { hour: '1PM', focused: 55, distracted: 5 },
  { hour: '2PM', focused: 40, distracted: 20 },
  { hour: '3PM', focused: 45, distracted: 15 },
];

const appDistribution = [
  { name: 'VS Code', value: 45, color: '#3182ce' },
  { name: 'Chrome', value: 25, color: '#48bb78' },
  { name: 'Slack', value: 15, color: '#ed64a6' },
  { name: 'Terminal', value: 10, color: '#ecc94b' },
  { name: 'Other', value: 5, color: '#a0aec0' },
];

const taskTimeline = [
  {
    date: 'Today',
    tasks: [
      {
        time: '9:15 AM',
        title: 'Implement user authentication',
        category: 'Development',
        tag: 'Personal',
        duration: '45m',
        distractions: [
          { time: '9:25 AM', app: 'Slack', duration: '2m' },
          { time: '9:35 AM', app: 'Chrome', duration: '3m' }
        ],
        color: '#3182ce'
      },
      {
        time: '10:00 AM',
        title: 'Code review for PR #123',
        category: 'Review',
        tag: 'Work',
        duration: '30m',
        distractions: [
          { time: '10:15 AM', app: 'Slack', duration: '5m' }
        ],
        color: '#48bb78'
      },
      {
        time: '11:00 AM',
        title: 'Team standup',
        category: 'Meeting',
        tag: 'Work',
        duration: '15m',
        distractions: [],
        color: '#ed64a6'
      }
    ]
  },
  {
    date: 'Yesterday',
    tasks: [
      {
        time: '2:00 PM',
        title: 'Database optimization',
        category: 'Development',
        tag: 'Work',
        duration: '90m',
        distractions: [
          { time: '2:30 PM', app: 'Chrome', duration: '10m' },
          { time: '3:00 PM', app: 'Slack', duration: '5m' }
        ],
        color: '#ecc94b'
      }
    ]
  }
];

const distractionTimeline = [
  {
    time: '9:15 AM',
    activity: 'Coding in VS Code',
    distractions: 2,
    duration: '45m',
    color: '#3182ce',
  },
  {
    time: '10:00 AM',
    activity: 'Code Review',
    distractions: 1,
    duration: '30m',
    color: '#48bb78',
  },
  {
    time: '10:30 AM',
    activity: 'Team Meeting',
    distractions: 0,
    duration: '60m',
    color: '#ed64a6',
  },
  {
    time: '11:30 AM',
    activity: 'Deep Work',
    distractions: 3,
    duration: '90m',
    color: '#ecc94b',
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative items-center flex flex-col justify-center">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 cabin-font text-black" style={{ textShadow: '0 2px 10px rgba(255, 184, 77, 0.5)' }}>Focus Analytics</h1>
          <p className="text-lg text-black/60 cabin-font">Your productivity insights for today</p>
        </div>

        {/* Calendar Component */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <button type="button" className="p-2 rounded-lg hover:bg-black/5">
            <span className="sr-only">Previous</span>
            ←
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 cabin-font text-black">Today</h2>
            <div className="flex gap-2 justify-center">
              <button type="button" className="w-16 h-16 rounded-lg bg-white/80 hover:bg-white flex flex-col items-center justify-center transition-all">
                <span className="text-sm text-gray-800">MON</span>
                <span className="text-lg font-semibold text-black">14</span>
              </button>
              <button type="button" className="w-16 h-16 rounded-lg bg-white/80 hover:bg-white flex flex-col items-center justify-center transition-all">
                <span className="text-sm text-gray-800">TUE</span>
                <span className="text-lg font-semibold text-black">15</span>
              </button>
              <button type="button" className="w-16 h-16 rounded-lg bg-white/80 hover:bg-white flex flex-col items-center justify-center transition-all">
                <span className="text-sm text-gray-800">WED</span>
                <span className="text-lg font-semibold text-black">16</span>
              </button>
              <button type="button" className="w-16 h-16 rounded-lg bg-white/80 hover:bg-white flex flex-col items-center justify-center transition-all">
                <span className="text-sm text-gray-800">THU</span>
                <span className="text-lg font-semibold text-black">17</span>
              </button>
              <button type="button" className="w-16 h-16 rounded-lg bg-white/80 hover:bg-white flex flex-col items-center justify-center transition-all">
                <span className="text-sm text-gray-800">FRI</span>
                <span className="text-lg font-semibold text-black">18</span>
              </button>
              <button type="button" className="w-16 h-16 rounded-lg bg-white flex flex-col items-center justify-center transition-all relative">
                <span className="text-sm text-gray-800">SAT</span>
                <span className="text-lg font-semibold text-black">19</span>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-500" />
              </button>
              <button type="button" className="w-16 h-16 rounded-lg bg-white/80 hover:bg-white flex flex-col items-center justify-center transition-all">
                <span className="text-sm text-gray-800">SUN</span>
                <span className="text-lg font-semibold text-black">20</span>
              </button>
            </div>
          </div>
          <button type="button" className="p-2 rounded-lg hover:bg-black/5">
            <span className="sr-only">Next</span>
            →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Focus Distribution Chart */}
          <div className="bg-white/95 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-sm border border-black/5 hover:bg-white/98 hover:-translate-y-0.5">
            <h2 className="text-xl font-semibold text-black mb-4 cabin-font">Focus Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="focused" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3182ce" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3182ce" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="distracted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fc8181" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#fc8181" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="focused"
                    stroke="#3182ce"
                    fillOpacity={1}
                    fill="url(#focused)"
                  />
                  <Area
                    type="monotone"
                    dataKey="distracted"
                    stroke="#fc8181"
                    fillOpacity={1}
                    fill="url(#distracted)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* App Usage Distribution */}
          <div className="bg-white/95 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-sm border border-black/5 hover:bg-white/98 hover:-translate-y-0.5">
            <h2 className="text-xl font-semibold text-black mb-4 cabin-font">App Usage</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {appDistribution.map((app) => (
                <div key={app.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: app.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {app.name} ({app.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/95 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-200 backdrop-blur-sm border border-white/20">
          <h2 className="text-xl font-semibold text-black mb-6 cabin-font">Activity Timeline</h2>
          <div className="space-y-6">
            {distractionTimeline.map((item, index) => (
              <div key={item.time} className="relative">
                {index !== distractionTimeline.length - 1 && (
                  <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200" />
                )}
                <div className="flex items-start">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-200 hover:scale-110 hover:rotate-3 border-2 border-white/20"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-white text-sm">{item.distractions}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{item.activity}</h3>
                      <span className="text-sm text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-gray-600">
                      Duration: {item.duration} • {item.distractions} distractions
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
