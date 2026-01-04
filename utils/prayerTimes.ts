export type Prayer = {
  name: string;
  nameArabic: string;
  time: string;
  timestamp: number;
  completed: boolean;
};

const deg2rad = (deg: number): number => deg * Math.PI / 180;
const rad2deg = (rad: number): number => rad * 180 / Math.PI;

const julianDate = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
};

const sunPosition = (jd: number): { declination: number; equation: number } => {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * Math.sin(deg2rad(g)) + 0.020 * Math.sin(deg2rad(2 * g))) % 360;
  
  const e = 23.439 - 0.00000036 * d;
  const RA = rad2deg(Math.atan2(Math.cos(deg2rad(e)) * Math.sin(deg2rad(L)), Math.cos(deg2rad(L))));
  const declination = rad2deg(Math.asin(Math.sin(deg2rad(e)) * Math.sin(deg2rad(L))));
  const equation = (q / 15.0) - (RA / 15.0);
  
  return { declination, equation };
};

const midDay = (time: number): number => {
  const equation = sunPosition(time).equation;
  return 12 - equation;
};

const timeForAngle = (angle: number, time: number, latitude: number, direction: 'ccw' | 'cw'): number => {
  const decl = sunPosition(time).declination;
  const noon = midDay(time);
  
  const t = (1 / 15.0) * rad2deg(
    Math.acos(
      (-Math.sin(deg2rad(angle)) - Math.sin(deg2rad(decl)) * Math.sin(deg2rad(latitude))) /
      (Math.cos(deg2rad(decl)) * Math.cos(deg2rad(latitude)))
    )
  );
  
  return noon + (direction === 'ccw' ? -t : t);
};

const asrTime = (time: number, latitude: number, factor: number = 1): number => {
  const decl = sunPosition(time).declination;
  
  const angle = -rad2deg(
    Math.atan(
      1 / (factor + Math.tan(deg2rad(latitude - decl)))
    )
  );
  
  return timeForAngle(angle, time, latitude, 'cw');
};

const formatTime = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = Math.floor((time - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const calculatePrayerTimes = async (
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<Prayer[]> => {
  const timezone = -date.getTimezoneOffset() / 60;
  const jd = julianDate(date) - longitude / 360.0;
  
  const fajrAngle = 18;
  const ishaAngle = 18;
  
  const fajrTime = timeForAngle(fajrAngle, jd, latitude, 'ccw');
  const dhuhrTime = midDay(jd) + 5 / 60;
  const asrTimeCalc = asrTime(jd, latitude, 1);
  const sunsetTime = timeForAngle(0.833, jd, latitude, 'cw');
  const maghribTime = sunsetTime + 3 / 60;
  const ishaTime = timeForAngle(ishaAngle, jd, latitude, 'cw');
  
  const adjustedFajr = fajrTime + timezone;
  const adjustedDhuhr = dhuhrTime + timezone;
  const adjustedAsr = asrTimeCalc + timezone;
  const adjustedMaghrib = maghribTime + timezone;
  const adjustedIsha = ishaTime + timezone;
  
  const createTimestamp = (timeHours: number): number => {
    const hours = Math.floor(timeHours);
    const minutes = Math.floor((timeHours - hours) * 60);
    const dateWithTime = new Date(date);
    dateWithTime.setHours(hours, minutes, 0, 0);
    return dateWithTime.getTime();
  };
  
  const now = Date.now();
  
  const fajrTimestamp = createTimestamp(adjustedFajr);
  const dhuhrTimestamp = createTimestamp(adjustedDhuhr);
  const asrTimestamp = createTimestamp(adjustedAsr);
  const maghribTimestamp = createTimestamp(adjustedMaghrib);
  const ishaTimestamp = createTimestamp(adjustedIsha);
  
  return [
    {
      name: 'Fajr',
      nameArabic: 'الفجر',
      time: formatTime(adjustedFajr),
      timestamp: fajrTimestamp,
      completed: now >= fajrTimestamp && now < dhuhrTimestamp ? false : now >= dhuhrTimestamp,
    },
    {
      name: 'Dhuhr',
      nameArabic: 'الظهر',
      time: formatTime(adjustedDhuhr),
      timestamp: dhuhrTimestamp,
      completed: now >= dhuhrTimestamp && now < asrTimestamp ? false : now >= asrTimestamp,
    },
    {
      name: 'Asr',
      nameArabic: 'العصر',
      time: formatTime(adjustedAsr),
      timestamp: asrTimestamp,
      completed: now >= asrTimestamp && now < maghribTimestamp ? false : now >= maghribTimestamp,
    },
    {
      name: 'Maghrib',
      nameArabic: 'المغرب',
      time: formatTime(adjustedMaghrib),
      timestamp: maghribTimestamp,
      completed: now >= maghribTimestamp && now < ishaTimestamp ? false : now >= ishaTimestamp,
    },
    {
      name: 'Isha',
      nameArabic: 'العشاء',
      time: formatTime(adjustedIsha),
      timestamp: ishaTimestamp,
      completed: false,
    },
  ];
};

export const calculateQiblaDirection = (latitude: number, longitude: number): number => {
  const meccaLat = 21.4225;
  const meccaLng = 39.8262;

  const lat1 = deg2rad(latitude);
  const lat2 = deg2rad(meccaLat);
  const dLng = deg2rad(meccaLng - longitude);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = rad2deg(Math.atan2(y, x));
  bearing = (bearing + 360) % 360;

  return bearing;
};
