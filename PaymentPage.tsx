

import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useLocation } = ReactRouterDOM as any;

const PaymentPage: React.FC = () => {
  const { state } = useLocation();
  const serviceName = state?.serviceName || 'Your service';
  const bookingIdRaw = state?.bookingId;
  const price = state?.price;

  // Format the booking ID
  const bookingId = bookingIdRaw ? `NME-${String(bookingIdRaw).padStart(6, '0')}` : `NME-PENDING`;

  // Add a one-time animation class to the body for the background
  useEffect(() => {
    document.body.classList.add('payment-success-bg');
    return () => {
      document.body.classList.remove('payment-success-bg');
    };
  }, []);

  return (
    <div className="relative z-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
       <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200/50 max-w-2xl mx-auto">
        <div className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-green-100 relative">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mt-8 tracking-tight">Booking Confirmed!</h1>
        <p className="text-slate-600 mt-3 text-lg max-w-md mx-auto">Your request for <span className="font-bold text-cyan-600">{serviceName}</span> has been submitted successfully.</p>
        
        <div className="mt-8 flex justify-center items-baseline gap-8">
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex-1">
                <p className="text-sm text-slate-500">Booking Reference ID</p>
                <p className="text-lg font-bold text-slate-700 tracking-wider">{bookingId}</p>
            </div>
             {price != null && (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 flex-1">
                    <p className="text-sm text-slate-500">Amount Paid</p>
                    <p className="text-lg font-bold text-slate-700 tracking-wider">{price === 0 ? 'FREE' : `₹${price}`}</p>
                </div>
             )}
        </div>


        <div className="mt-8 prose prose-sm text-slate-500">
            <p>You will receive a confirmation email shortly. Please keep the reference ID for your records. Our team will review your documents and contact you if any further information is needed.</p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
                to="/" 
                className="w-full sm:w-auto px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
                Book Another Service
            </Link>
            <a 
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full sm:w-auto px-8 py-3 text-base font-bold text-slate-700 bg-slate-100 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
                Download Summary
            </a>
        </div>
      </div>
      <style>{`
        body.payment-success-bg {
          overflow: hidden;
        }
        body.payment-success-bg::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(ellipse at top, #e0f7fa, transparent),
                        radial-gradient(ellipse at bottom, #f0f9ff, transparent);
            z-index: 0;
            opacity: 0.8;
        }

        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #4CAF50;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #fff;
          stroke-miterlimit: 10;
          margin: 10% auto;
          box-shadow: inset 0px 0px 0px #4CAF50;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }
        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 60px #E8F5E9;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;