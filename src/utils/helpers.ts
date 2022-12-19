// minutes
const codeTimeout = 5;

export const generateRandomCode = (length = 6) => {
  const chars =
    'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
  const randomArray = Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  );

  return randomArray.join('').toUpperCase();
};

export const calcMinutes = (start: Date, finish: Date): number => {
  return Math.floor(
    (new Date(finish).getTime() - new Date(start).getTime()) / 60000,
  );
};

export const checkCodeTimeout = (startDate: Date): boolean => {
  const count = calcMinutes(startDate, new Date());
  return count < codeTimeout;
};
