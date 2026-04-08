export const requestPermission = async () => {
  if (!("Notification" in window)) return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const showNotification = (text: string) => {
  if (Notification.permission === "granted") {
    new Notification("Check New Tweet", {
      body: text,
    });
  }
};
