import React from 'react';

export default function EarningsDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ 
        background: '#fef3c7', 
        border: '1px solid #fbbf24', 
        borderRadius: 8, 
        padding: 16,
        marginBottom: 24
      }}>
        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Payment Processing Unavailable</h3>
        <p style={{ color: '#92400e', margin: 0 }}>
          Payment processing features have been disabled. Earnings dashboard is not available.
        </p>
      </div>
    </div>
  );
}
