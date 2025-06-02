'use client';

import React, { useState } from 'react';
import { Calendar, MessageSquare, Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function Home() {
  const [showSurvey, setShowSurvey] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    business: '',
    employees: '',
    // CD Questions transformed to yes/no
    timeWasterExists: '',
    problemsHappen: '',
    thingsFallThrough: '',
    coordinationHard: '',
    stressfulMoments: '',
    lastMinuteChanges: '',
    hardToTrack: '',
    // Legal questions for owners
    worriedAboutLegal: '',
    hadLegalIssue: '',
    hadLaborComplaint: '',
    // General questions
    usesWhatsApp: '',
    hasLanguageBarriers: '',
    wantsDocumentation: '',
    biggestProblems: [] as string[],
    interestedInCall: ''
  });
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Email validation
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
                            setSubmitError('There was an error submitting your response. Please try again or email us directly at hello@operantive.com');
    } finally {
      setSubmitting(false);
    }
  };

  const YesNoQuestion = ({ 
    name, 
    question, 
    required = false 
  }: { 
    name: string; 
    question: string; 
    required?: boolean;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-4">
        {question} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setFormData({...formData, [name]: 'yes'})}
          disabled={submitting}
          className={`flex-1 p-4 rounded-lg border-2 transition-all font-medium ${
            formData[name as keyof typeof formData] === 'yes' 
              ? 'border-green-600 bg-green-50 text-green-900' 
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setFormData({...formData, [name]: 'no'})}
          disabled={submitting}
          className={`flex-1 p-4 rounded-lg border-2 transition-all font-medium ${
            formData[name as keyof typeof formData] === 'no' 
              ? 'border-red-600 bg-red-50 text-red-900' 
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          No
        </button>
      </div>
    </div>
  );

  const MultipleChoiceQuestion = ({ 
    name, 
    question, 
    options, 
    required = false 
  }: { 
    name: string; 
    question: string; 
    options: Array<{key: string, label: string}>; 
    required?: boolean;
  }) => (
    <div>
      <label className="block text-base font-semibold text-gray-900 mb-4">
        {question} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFormData({...formData, [name]: option.key})}
            disabled={submitting}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
              formData[name as keyof typeof formData] === option.key 
                ? 'border-blue-600 bg-blue-50 text-blue-900' 
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const MultipleSelectQuestion = ({ 
    name, 
    question, 
    options, 
    required = false 
  }: { 
    name: string; 
    question: string; 
    options: Array<{key: string, label: string}>; 
    required?: boolean;
  }) => {
    const currentValues = formData[name as keyof typeof formData] as string[] || [];
    
    const toggleOption = (optionKey: string) => {
      const newValues = currentValues.includes(optionKey)
        ? currentValues.filter(v => v !== optionKey)
        : [...currentValues, optionKey];
      setFormData({...formData, [name]: newValues});
    };

    return (
      <div>
        <label className="block text-base font-semibold text-gray-900 mb-4">
          {question} {required && <span className="text-red-500">*</span>}
          <span className="text-sm font-normal text-gray-600 block mt-1">(Select all that apply)</span>
        </label>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => toggleOption(option.key)}
              disabled={submitting}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                currentValues.includes(option.key)
                  ? 'border-blue-600 bg-blue-50 text-blue-900' 
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                  currentValues.includes(option.key)
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {currentValues.includes(option.key) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (showSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Operantive</h1>
            <button 
              onClick={() => setShowSurvey(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Survey</h2>
            <p className="text-gray-600 mb-8">Help us understand small business challenges. Takes 2 minutes!</p>
            
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Thank you!</h3>
                <p className="text-gray-600 mb-6">Your insights help us build something useful for small businesses.</p>
                
                {formData.interestedInCall === 'yes' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Great! Let's chat.</h4>
                    <p className="text-blue-800 mb-4">We&apos;ll reach out to schedule a quick call to learn more about your specific challenges.</p>
                    <a
                      href="https://calendly.com/hello-operantive"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Calendar className="h-4 w-4" />
                      Or schedule now
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}
                
                {/* Contact Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone (optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      disabled={submitting}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-4">
                    What best describes you? *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'owner'})}
                      disabled={submitting}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.role === 'owner' 
                          ? 'border-blue-600 bg-blue-50 text-blue-900' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-semibold">Business Owner</div>
                        <div className="text-sm">Manager/Operator</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, role: 'employee'})}
                      disabled={submitting}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.role === 'employee' 
                          ? 'border-blue-600 bg-blue-50 text-blue-900' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-center">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <div className="font-semibold">Employee</div>
                        <div className="text-sm">Team Member</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Business Type */}
                {formData.role && (
                  <MultipleChoiceQuestion
                    name="business"
                    question={`What type of business do you ${formData.role === 'owner' ? 'run' : 'work for'}?`}
                    required
                    options={[
                      { key: 'gas-station', label: '⛽ Gas Station / Convenience Store' },
                      { key: 'restaurant', label: '🍕 Restaurant / Food Service' },
                      { key: 'retail', label: '🛍️ Retail Store / Shopping' },
                      { key: 'auto-service', label: '🔧 Auto Repair / Service Business' },
                      { key: 'grocery', label: '🛒 Grocery / Market' },
                      { key: 'other', label: '🏢 Other Small Business' }
                    ]}
                  />
                )}

                {/* Employee Count (Owner only) */}
                {formData.role === 'owner' && (
                  <MultipleChoiceQuestion
                    name="employees"
                    question="How many employees do you have?"
                    required
                    options={[
                      { key: '1-5', label: '1-5 employees' },
                      { key: '6-10', label: '6-10 employees' },
                      { key: '11-20', label: '11-20 employees' },
                      { key: '21+', label: '21+ employees' }
                    ]}
                  />
                )}

                {/* Customer Discovery Questions */}
                {formData.role && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-t pt-6">Business Operations</h3>
                    
                    {formData.role === 'owner' ? (
                      <>
                        <YesNoQuestion
                          name="timeWasterExists"
                          question="Is there any part of running your business that takes up more time than it should?"
                          required
                        />

                        <YesNoQuestion
                          name="problemsHappen"
                          question="In the last 6 months, has something gone wrong in your business that could have been prevented with better communication or coordination?"
                          required
                        />

                        <YesNoQuestion
                          name="thingsFallThrough"
                          question="When you step away from your business for a day, do important things sometimes fall through the cracks?"
                          required
                        />

                        <YesNoQuestion
                          name="coordinationHard"
                          question="Do you find it challenging to coordinate people and tasks smoothly in your business?"
                          required
                        />

                        {/* Legal Questions for Owners */}
                        <h4 className="text-md font-semibold text-gray-900 mt-8 mb-4">Legal & Compliance</h4>
                        
                        <YesNoQuestion
                          name="worriedAboutLegal"
                          question="Have you ever worried about legal trouble due to how something was communicated or documented?"
                          required
                        />

                        <YesNoQuestion
                          name="hadLegalIssue"
                          question="Have you ever had a legal issue with an employee or a close call?"
                          required
                        />

                        <YesNoQuestion
                          name="hadLaborComplaint"
                          question="Have you ever had to deal with a labor law, workplace, or documentation issue/complaint?"
                          required
                        />
                      </>
                    ) : (
                      <>
                        <YesNoQuestion
                          name="stressfulMoments"
                          question="Do you sometimes feel stressed or confused at work because instructions or expectations aren't clear?"
                          required
                        />

                        <YesNoQuestion
                          name="lastMinuteChanges"
                          question="Do you experience last-minute changes to your schedule or responsibilities at work?"
                          required
                        />

                        <YesNoQuestion
                          name="hardToTrack"
                          question="Is there any part of your job that's hard to keep track of or remember without written reminders?"
                          required
                        />
                      </>
                    )}

                    <YesNoQuestion
                      name="usesWhatsApp"
                      question="Do you currently use WhatsApp, text messages, or calls for work communication?"
                      required
                    />

                    <YesNoQuestion
                      name="hasLanguageBarriers"
                      question="Do language differences ever cause communication problems at work?"
                    />

                    <YesNoQuestion
                      name="wantsDocumentation"
                      question={formData.role === 'owner'
                        ? "Would you want better documentation of work conversations and decisions for legal protection?"
                        : "Would you prefer to have clearer, written instructions rather than just verbal communication?"
                      }
                      required
                    />

                    <MultipleSelectQuestion
                      name="biggestProblems"
                      question={formData.role === 'owner'
                        ? "What are the biggest challenges in your business right now?"
                        : "What are the biggest challenges you face at work?"
                      }
                      required
                      options={formData.role === 'owner' ? [
                        { key: 'staff-scheduling', label: '📅 Staff scheduling and attendance' },
                        { key: 'communication', label: '💬 Communication between people' },
                        { key: 'task-management', label: '📋 Making sure tasks get completed' },
                        { key: 'vendor-coordination', label: '🚛 Vendor and supplier coordination' },
                        { key: 'customer-complaints', label: '🚨 Customer complaints and problems' },
                        { key: 'paperwork', label: '📄 Paperwork and record keeping' },
                        { key: 'training', label: '🎓 Training new employees' },
                        { key: 'quality-control', label: '✅ Quality control and standards' },
                        { key: 'inventory', label: '📦 Inventory management' },
                        { key: 'cash-flow', label: '💰 Cash flow and payments' },
                        { key: 'regulations', label: '⚖️ Regulations and compliance' },
                        { key: 'technology', label: '💻 Technology and systems' },
                        { key: 'other-owner', label: '🔧 Other (please specify in follow-up)' }
                      ] : [
                        { key: 'unclear-instructions', label: '❓ Unclear instructions or expectations' },
                        { key: 'schedule-changes', label: '📅 Last-minute schedule changes' },
                        { key: 'poor-communication', label: '💬 Poor communication from management' },
                        { key: 'insufficient-training', label: '🎓 Not enough training for my role' },
                        { key: 'too-many-tasks', label: '📋 Too many tasks to keep track of' },
                        { key: 'language-barriers', label: '🌐 Language or communication barriers' },
                        { key: 'inconsistent-policies', label: '📋 Inconsistent rules or policies' },
                        { key: 'no-feedback', label: '🔄 Not getting feedback on my work' },
                        { key: 'workplace-stress', label: '😰 High stress or pressure at work' },
                        { key: 'equipment-issues', label: '🔧 Equipment or technology problems' },
                        { key: 'unfair-treatment', label: '⚖️ Feeling treated unfairly' },
                        { key: 'work-life-balance', label: '⚖️ Work-life balance issues' },
                        { key: 'other-employee', label: '🔧 Other (please specify in follow-up)' }
                      ]}
                    />
                  </div>
                )}

                {/* Call Interest */}
                {formData.role && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <YesNoQuestion
                      name="interestedInCall"
                      question="Would you be interested in a 15-minute call to share more about your challenges? (No sales pitch - just learning)"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-4 px-6 rounded-lg transition-colors font-medium text-lg ${
                    !formData.role || emailError || submitting
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={!formData.role || !!emailError || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Operantive</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            A smarter platform is on the way — made for businesses like yours.
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Help shape a new tool by sharing your experience. 
            2-minute survey or 15-minute chat - your choice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => setShowSurvey(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              Quick 2-min survey
            </button>
            <a
              href="https://calendly.com/hello-operantive"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Schedule a 15-min chat
            </a>
          </div>
          
          <p className="text-sm text-gray-500">No sales pitch • All conversations confidential</p>
        </div>

        <div className="bg-white rounded-lg p-8 mb-12 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Who We&apos;re Talking To</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Small Business Owners</h4>
              <p className="text-gray-600">Gas stations, restaurants, retail stores</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">2-20</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Team Size</h4>
              <p className="text-gray-600">Businesses with 2-20 employees</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Your Experience Matters</h4>
              <p className="text-gray-600">Help us build something useful</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Why We&apos;re Doing This</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            We&apos;re entrepreneurs building tools for business owners who work hard every day. 
            Your insights help us create something that actually solves real problems.
          </p>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">Building something new for SMB operators</p>
          <p className="text-gray-400 text-sm">Questions? Email us at hello@operantive.com</p>
        </div>
      </footer>
    </div>
  );
}