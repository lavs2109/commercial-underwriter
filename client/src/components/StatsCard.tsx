interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  bgColor: string;
}

export default function StatsCard({ title, value, subtitle, icon, bgColor }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {subtitle && (
        <div className="mt-4">
          <span className="text-xs text-secondary font-medium">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
