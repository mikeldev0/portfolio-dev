const HOLIDAY_END_DAY = 7;

export const isWithinHolidaySeason = (date = new Date()) => {
  const month = date.getMonth();
  const day = date.getDate();

  return month === 11 || (month === 0 && day <= HOLIDAY_END_DAY);
};
