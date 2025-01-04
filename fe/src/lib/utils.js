export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

let notificationAudio;

export const preloadNotificationSound = () => {
  notificationAudio = new Audio('https://s3.scz.my.id/m4s/attachments/notification.mp3');
  notificationAudio.load();
};

export const playNotificationSound = () => {
  if (notificationAudio) {
    notificationAudio.play().catch(error => {
      if (error.name === 'NotAllowedError') {
        console.log("Autoplay prevented. User interaction may be required.");
      } else {
        console.error("Error playing sound:", error);
      }
    });
  } else {
    console.warn("Notification sound not preloaded");
  }
};

export const showNotification = (title, options) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};

export const updateFaviconBadge = () => {
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, 16, 16);
      ctx.fillStyle = 'red';
      ctx.arc(12, 12, 4, 0, 2 * Math.PI);
      ctx.fill();
      favicon.href = canvas.toDataURL('image/png');
    };
    img.src = favicon.href;
  }
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const askNotificationPermissionOnFirstVisit = () => {
  const hasAskedBefore = localStorage.getItem('notificationPermissionAsked');
  
  if (!hasAskedBefore) {
    requestNotificationPermission().then(granted => {
      if (granted) {
        preloadNotificationSound();
      } else {
      }
    });
  } else {
    preloadNotificationSound();
  }
};