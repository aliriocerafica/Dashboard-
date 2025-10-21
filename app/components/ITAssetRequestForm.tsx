'use client';

import { useState, useRef } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SignatureCanvasRef {
  clear: () => void;
  toDataURL: () => string;
  isEmpty: () => boolean;
}

export default function ITAssetRequestForm() {
  const signatureCanvasRef = useRef<SignatureCanvasRef>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    asset: '',
    reason: '',
  });

  const [signature, setSignature] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requestId, setRequestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const assetOptions = [
    'Mouse',
    'Laptop',
    'Keyboard',
    'Laptop Set (Laptop + Mouse + Keyboard)',
    'Monitor',
    'Headset',
    'Webcam',
    'Docking Station',
    'USB Hub',
    'External Hard Drive',
    'Other (Please specify in reason)',
  ];

  const handleMouseDown = () => setIsDrawing(true);
  const handleMouseUp = () => setIsDrawing(false);

  const handleSignatureCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (e.type === 'mousemove') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
  };

  const handleCanvasTouchEnd = () => {
    setIsDrawing(false);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.name || !formData.department || !formData.asset || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    // Get signature
    const canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
    if (!canvas) {
      setError('Signature canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    const isCanvasBlank = imageData?.data.every((pixel) => pixel === 0);

    if (isCanvasBlank) {
      setError('Please provide a signature');
      return;
    }

    const signatureData = canvas.toDataURL('image/png');
    setIsLoading(true);

    try {
      const response = await fetch('/api/submit-it-asset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          department: formData.department,
          asset: formData.asset,
          reason: formData.reason,
          signature: signatureData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Request submitted successfully! Request ID: ${data.requestId}`);
        setRequestId(data.requestId);

        // Reset form
        setFormData({
          name: '',
          department: '',
          asset: '',
          reason: '',
        });
        clearSignature();

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
          setRequestId('');
        }, 5000);
      } else {
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">IT Asset Request Form</h2>
      <p className="text-gray-600 mb-6">Submit a request for IT assets needed for your work</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Account/Department <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="e.g., IT Department, Sales Team"
            required
          />
        </div>

        {/* Asset Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Asset Requesting <span className="text-red-600">*</span>
          </label>
          <select
            name="asset"
            value={formData.asset}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            required
          >
            <option value="">Select an asset</option>
            {assetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason for Requesting <span className="text-red-600">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Please explain why you need this asset"
            required
          />
        </div>

        {/* Signature */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Digital Signature <span className="text-red-600">*</span>
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-3 bg-gray-50">
            <canvas
              id="signatureCanvas"
              ref={signatureCanvasRef}
              width={500}
              height={150}
              className="w-full cursor-crosshair bg-white"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleSignatureCanvas}
              onTouchStart={handleCanvasTouchStart}
              onTouchEnd={handleCanvasTouchEnd}
              onTouchMove={handleCanvasTouchMove}
              style={{
                touchAction: 'none',
              }}
            />
          </div>
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-gray-600 hover:text-gray-900 underline mb-2"
          >
            Clear Signature
          </button>
          <p className="text-xs text-gray-500">
            ✓ I hereby consent to submit this IT asset request form with my digital signature.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">Success!</h4>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Request'
          )}
        </button>
      </form>
    </div>
  );
}
