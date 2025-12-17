import React from 'react';
import { Check } from 'lucide-react';
import './Stepper.css';

const Stepper = ({ steps, currentStep, completedSteps = [] }) => {
  return (
    <div className="stepper-container">
      <div className="stepper-wrapper">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber);
          const isClickable = stepNumber <= Math.max(currentStep, ...completedSteps);

          return (
            <div key={index} className="stepper-item">
              {/* Step Circle */}
              <div 
                className={`step-circle ${
                  isCompleted ? 'completed' : 
                  isActive ? 'active' : 
                  isClickable ? 'clickable' : 'inactive'
                }`}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  <span className="step-number">{stepNumber}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="step-content">
                <div className={`step-title ${isActive ? 'active' : ''}`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="step-description">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`step-connector ${
                    isCompleted || (isActive && stepNumber < currentStep) ? 'completed' : 'incomplete'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;