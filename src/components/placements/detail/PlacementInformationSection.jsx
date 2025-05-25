import React from 'react';
import { Badge } from '@/components/ui/badge.jsx'; // Adj
import { Briefcase, Building, CalendarDays, FileText, Users, CircleDollarSign, MapPin, Laptop, CalendarClock, Link as LinkIcon, ExternalLink, Info as InfoIcon } from 'lucide-react'; // Renamed Link to LinkIcon to avoid conflict
// import { PlacementDetails } from './placementDetailTypes'; // Removed

// No PlacementInformationSectionProps interface

const renderDetailItem = (IconComponent, label, value, isLink = false) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex items-start space-x-3">
      <IconComponent className="h-5 w-5 text-slate-500 mt-1 flex-shrink-0" />
      <div>
        <span className="font-semibold text-slate-700">{label}:</span>{' '}
        {isLink && typeof displayValue === 'string' ? (
          <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
            {displayValue} <ExternalLink className="inline h-4 w-4" />
          </a>
        ) : (
          <span className="text-slate-600 break-words">{displayValue}</span>
        )}
      </div>
    </div>
  );
};

const PlacementInformationSection = ({ placement }) => {
  return (
    <>
      <div className="md:col-span-2 space-y-4">
        {renderDetailItem(Briefcase, "Job Designation", placement.jobDesignation)}
        {renderDetailItem(CircleDollarSign, "CTC / Stipend", placement.ctcDetails)}
        {renderDetailItem(MapPin, "Location", placement.location)}
        {renderDetailItem(Laptop, "Mode of Recruitment", placement.modeOfRecruitment)}
        {renderDetailItem(Users, "Eligible Branches", placement.eligibleBranches)}
        {renderDetailItem(FileText, "Job Description", placement.jobDescriptionLink, true)}
        {renderDetailItem(Users, "Eligible Batches", placement.batches)}
      </div>
      
      <div className="space-y-4">
        {renderDetailItem(CalendarDays, "Application Deadline", placement.applicationDeadline ? new Date(placement.applicationDeadline).toLocaleDateString() : 'N/A')}
        {renderDetailItem(CalendarClock, "Tentative Drive Date", placement.tentativeDriveDate ? new Date(placement.tentativeDriveDate).toLocaleDateString() : 'N/A')}
        {renderDetailItem(LinkIcon, "Apply Link", placement.applyLink, true)}
         <div className="space-y-1">
           <p className="font-semibold text-slate-700 flex items-center"><FileText className="h-5 w-5 text-slate-500 mr-2" />Eligibility Criteria:</p>
           <ul className="list-disc list-inside pl-2 text-slate-600 text-sm">
              {placement.eligibilityCriteria?.activeBacklogs && <li>Active Backlogs: {placement.eligibilityCriteria.activeBacklogs}</li>}
              {placement.eligibilityCriteria?.deadBacklogs && <li>Dead Backlogs: {placement.eligibilityCriteria.deadBacklogs}</li>}
              {placement.eligibilityCriteria?.otherEligibilities?.map(crit => <li key={crit}>{crit}</li>)}
           </ul>
        </div>
      </div>

      {placement.driveRounds && placement.driveRounds.length > 0 && (
        <div className="md:col-span-3 space-y-2 pt-4 border-t mt-2">
          <h3 className="text-lg font-semibold text-slate-700">Drive Rounds:</h3>
          <ul className="list-disc list-inside pl-2 text-slate-600 space-y-1">
            {placement.driveRounds.map((round, index) => (
              <li key={index}>{round}</li>
            ))}
          </ul>
        </div>
      )}
       {placement.notes && placement.notes.length > 0 && (
        <div className="md:col-span-3 space-y-2 pt-4 border-t mt-2">
          <h3 className="text-lg font-semibold text-slate-700 flex items-center"><InfoIcon className="h-5 w-5 text-slate-500 mr-2" />Notes:</h3>
          <ul className="list-disc list-inside pl-2 text-slate-600 space-y-1">
            {placement.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default PlacementInformationSection;
