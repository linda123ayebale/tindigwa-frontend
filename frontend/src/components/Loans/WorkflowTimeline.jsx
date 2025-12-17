import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Send, FileCheck } from 'lucide-react';
import './WorkflowTimeline.css';

/**
 * WorkflowTimeline Component
 * Displays a vertical timeline of workflow events (CREATED, APPROVED, REJECTED, DISBURSED, etc.)
 * 
 * @param {Array} workflowHistory - Array of workflow event objects from API
 */
const WorkflowTimeline = ({ workflowHistory = [] }) => {
  /**
   * Get icon and color based on action type
   */
  const getEventStyle = (action) => {
    const actionUpper = action?.toUpperCase() || '';
    
    switch (actionUpper) {
      case 'CREATED':
      case 'SUBMITTED':
        return {
          icon: Clock,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          lineColor: 'bg-blue-300',
          label: 'Created'
        };
      
      case 'APPROVED':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          lineColor: 'bg-green-300',
          label: 'Approved'
        };
      
      case 'REJECTED':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          lineColor: 'bg-red-300',
          label: 'Rejected'
        };
      
      case 'DISBURSED':
        return {
          icon: Send,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          lineColor: 'bg-purple-300',
          label: 'Disbursed'
        };
      
      case 'COMPLETED':
      case 'CLOSED':
        return {
          icon: FileCheck,
          bgColor: 'bg-teal-100',
          iconColor: 'text-teal-600',
          lineColor: 'bg-teal-300',
          label: 'Completed'
        };
      
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          lineColor: 'bg-gray-300',
          label: action || 'Event'
        };
    }
  };

  /**
   * Format date and time
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!workflowHistory || workflowHistory.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workflow Timeline</h3>
            <p className="text-sm text-gray-500">No events recorded yet</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">Workflow events will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Clock className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workflow Timeline</h3>
          <p className="text-sm text-gray-500">
            {workflowHistory.length} {workflowHistory.length === 1 ? 'event' : 'events'}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {workflowHistory.map((event, index) => {
          const style = getEventStyle(event.action);
          const Icon = style.icon;
          const isLast = index === workflowHistory.length - 1;

          return (
            <div key={index} className="relative flex gap-4">
              {/* Timeline Line (vertical connector) */}
              {!isLast && (
                <div 
                  className={`absolute left-5 top-12 bottom-0 w-0.5 ${style.lineColor}`}
                  style={{ height: 'calc(100% + 24px)' }}
                />
              )}

              {/* Icon Circle */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${style.iconColor}`} />
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {/* Action & Timestamp */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{style.label}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Performer */}
                  {event.performedBy && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-600">By:</span>
                      <span className="text-xs font-medium text-gray-900">{event.performedBy}</span>
                    </div>
                  )}

                  {/* Notes / Reason */}
                  {event.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-700 italic">
                        &ldquo;{event.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTimeline;
