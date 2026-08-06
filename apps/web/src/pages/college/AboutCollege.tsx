import { COLLEGE, PROGRAMS } from '@tribhuvan/shared';
import { Card } from '../../components/ui/Card';

export function AboutCollege() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="bg-navy text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-2">{COLLEGE.name}</h1>
          <p className="text-gray-300 text-lg">{COLLEGE.location}</p>
          <div className="flex justify-center gap-6 mt-6 text-sm text-gray-400">
            <a href={COLLEGE.website} className="hover:text-gold transition-colors">{COLLEGE.website}</a>
            <span>{COLLEGE.email}</span>
            <span>{COLLEGE.phone}</span>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {COLLEGE.affiliations.map((aff) => (
          <Card key={aff.university}>
            <h2 className="text-xl font-bold text-brand-text mb-4">{aff.university}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aff.programs.map((prog) => {
                const info = PROGRAMS.find((p) => p.name === prog);
                return (
                  <div key={prog} className="p-4 bg-brand-bg rounded-lg">
                    <p className="font-medium text-brand-text">{prog}</p>
                    {info && <p className="text-xs text-brand-muted mt-1">{info.duration} years • {info.semesters} semesters • Code: {info.code}</p>}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
