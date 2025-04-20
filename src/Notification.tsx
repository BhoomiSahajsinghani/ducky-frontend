import * as React from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  nudge: string;
}

export default function Notification({ message, nudge }: NotificationProps) {
  React.useEffect(() => {
    // Close notification after 5 seconds
    setTimeout(() => window.close(), 5000);
  }, []);

  return (
    <button 
      type="button"
      className="notification" 
      onClick={() => window.close()} 
      onKeyDown={(e) => e.key === 'Enter' && window.close()}
    >
      <div className="message">{nudge}</div>
      {nudge && <div className="nudge">{nudge}</div>}
    </button>
  );
}
