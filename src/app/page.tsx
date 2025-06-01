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
    timeWaster: '',
    problems: '',
    stressfulMoments: '',
    lastWentWrong: '',
    stepAway: '',
    coordination: ''
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

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Discovery Survey</h2>
            <p className="text-gray-600 mb-8">Help us understand the real challenges in small business operations. Your insights shape what we build.</p>
            
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you!</h3>
                <p className="text-gray-600">We&apos;ll review your responses and may reach out for a brief follow-up conversation.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">Your name</label>
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
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    style={{ color: '#111827' }}
                    required
                    disabled={submitting}
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    style={{ color: '#111827' }}
                    disabled={submitting}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-4">What best describes you?</label>
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

                {formData.role === 'owner' && (
                  <>
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">What type of business do you run?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'Gas Station/Convenience', title: 'Gas Station', subtitle: 'Convenience Store' },
                          { key: 'Restaurant/Food Service', title: 'Restaurant', subtitle: 'Food Service' },
                          { key: 'Retail/Shopping', title: 'Retail Store', subtitle: 'Shopping' },
                          { key: 'Auto/Service', title: 'Auto Repair', subtitle: 'Service Business' },
                          { key: 'Grocery/Market', title: 'Grocery', subtitle: 'Market' },
                          { key: 'Other', title: 'Other', subtitle: 'Small Business' }
                        ].map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setFormData({...formData, business: option.key})}
                            disabled={submitting}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              formData.business === option.key 
                                ? 'border-blue-600 bg-blue-50 text-blue-900' 
                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-semibold">{option.title}</div>
                            <div className="text-sm">{option.subtitle}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">How many employees do you have?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: '1-5', title: '1-5', subtitle: 'employees' },
                          { key: '6-10', title: '6-10', subtitle: 'employees' },
                          { key: '11-20', title: '11-20', subtitle: 'employees' },
                          { key: '21+', title: '21+', subtitle: 'employees' }
                        ].map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setFormData({...formData, employees: option.key})}
                            disabled={submitting}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              formData.employees === option.key 
                                ? 'border-blue-600 bg-blue-50 text-blue-900' 
                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-semibold">{option.title}</div>
                            <div className="text-sm">{option.subtitle}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">What part of running your business takes up more time than it should? (Walk us through a typical example)</label>
                      <textarea
                        name="timeWaster"
                        value={formData.timeWaster}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">Tell us about the last time something went wrong in your business - what led up to it and how did you resolve it?</label>
                      <textarea
                        name="lastWentWrong"
                        value={formData.lastWentWrong}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">When you step away from your business for a day, what falls through the cracks and who handles things?</label>
                      <textarea
                        name="stepAway"
                        value={formData.stepAway}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">What gets in the way of smooth coordination with your people? (Do you rely on memory, notes, apps, etc.)</label>
                      <textarea
                        name="coordination"
                        value={formData.coordination}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}

                {formData.role === 'employee' && (
                  <>
                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-4">What type of business do you work for?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'Gas Station/Convenience', title: 'Gas Station', subtitle: 'Convenience Store' },
                          { key: 'Restaurant/Food Service', title: 'Restaurant', subtitle: 'Food Service' },
                          { key: 'Retail/Shopping', title: 'Retail Store', subtitle: 'Shopping' },
                          { key: 'Auto/Service', title: 'Auto Repair', subtitle: 'Service Business' },
                          { key: 'Grocery/Market', title: 'Grocery', subtitle: 'Market' },
                          { key: 'Other', title: 'Other', subtitle: 'Small Business' }
                        ].map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setFormData({...formData, business: option.key})}
                            disabled={submitting}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              formData.business === option.key 
                                ? 'border-blue-600 bg-blue-50 text-blue-900' 
                                : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-semibold">{option.title}</div>
                            <div className="text-sm">{option.subtitle}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">When do you feel most stressed or confused at work? (Give us a specific example)</label>
                      <textarea
                        name="stressfulMoments"
                        value={formData.stressfulMoments}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">How would a new person joining your team know what to do? (What would you tell them first?)</label>
                      <textarea
                        name="coordination"
                        value={formData.coordination}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">Tell us about a time your workday changed last minute - how did you find out and how often does this happen?</label>
                      <textarea
                        name="lastWentWrong"
                        value={formData.lastWentWrong}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-900 mb-2">What part of your job is hardest to keep track of? (Are you expected to remember everything yourself?)</label>
                      <textarea
                        name="problems"
                        value={formData.problems}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-md transition-colors font-medium ${
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
            We are building something for small business owners like you
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Help shape a new tool by sharing your experience running your business. 
            15 minutes, no sales pitch.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="https://calendly.com/hello-operantive"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Schedule a 15-min chat
            </a>
            <button
              onClick={() => setShowSurvey(true)}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
            >
              <MessageSquare className="h-5 w-5" />
              Take discovery survey
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 mb-12 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Who We Are Talking To</h3>
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
              <p className="text-gray-600">All conversations are confidential</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Why We Are Doing This</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            We are entrepreneurs building tools for business owners who work hard every day. 
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