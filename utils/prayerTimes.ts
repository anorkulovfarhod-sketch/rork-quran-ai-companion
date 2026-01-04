export type Prayer = {
  name: string;
  nameArabic: string;
  time: string;
  timestamp: number;
  completed: boolean;
};

type CalculationMethod = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'Tehran' | 'Jafari';

type MethodParams = {
  fajr: number;
  isha: number | string;
};

const CALCULATION_METHODS: Record<CalculationMethod, MethodParams> = {
  MWL: { fajr: 18, isha: 17 },
  ISNA: { fajr: 15, isha: 15 },
  Egypt: { fajr: 19.5, isha: 17.5 },
  Makkah: { fajr: 18.5, isha: 90 },
  Karachi: { fajr: 18, isha: 18 },
  Tehran: { fajr: 17.7, isha: 14 },
  Jafari: { fajr: 16, isha: 14 },
};

const deg2rad = (deg: number): number => deg * Math.PI / 180;
const rad2deg = (rad: number): number => rad * 180 / Math.PI;

const fixAngle = (angle: number): number => {
  let a = angle;
  while (a < 0) a += 360;
  while (a >= 360) a -= 360;
  return a;
};

const fixHour = (hour: number): number => {
  let h = hour;
  while (h < 0) h += 24;
  while (h >= 24) h -= 24;
  return h;
};

const julianDate = (date: Date): number => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day + b - 1524.5;
};

const meanLongitude = (d: number): number => {
  return fixAngle(280.460 + 0.9856474 * d);
};

const meanAnomaly = (d: number): number => {
  return fixAngle(357.528 + 0.9856003 * d);
};

const sunDeclination = (d: number): number => {
  const e = 23.439 - 0.0000004 * d;
  const L = meanLongitude(d);
  const g = meanAnomaly(d);
  const lambda = L + 1.915 * Math.sin(deg2rad(g)) +
    0.020 * Math.sin(deg2rad(2 * g));

  return rad2deg(Math.asin(Math.sin(deg2rad(e)) *
    Math.sin(deg2rad(lambda))));
};

const equationOfTime = (d: number): number => {
  const L = meanLongitude(d);
  const g = meanAnomaly(d);
  const e = 0.016708634 - 0.000042037 * d / 36525;

  const y = Math.tan(deg2rad(23.439 / 2));
  const y2 = y * y;

  const sin2L = Math.sin(deg2rad(2 * L));
  const sinG = Math.sin(deg2rad(g));
  const cos2L = Math.cos(deg2rad(2 * L));
  const sin4L = Math.sin(deg2rad(4 * L));
  const sin2G = Math.sin(deg2rad(2 * g));

  const eqt = y2 * sin2L - 2 * e * sinG + 4 * e * y2 * sinG * cos2L -
    0.5 * y2 * y2 * sin4L - 1.25 * e * e * sin2G;

  return rad2deg(eqt) * 4;
};

const computeTime = (
  angle: number,
  dec: number,
  noon: number,
  lat: number,
  isMorning: boolean = true
): number => {
  const cosH = (Math.cos(deg2rad(90 + angle)) -
    Math.sin(deg2rad(lat)) * Math.sin(deg2rad(dec))) /
    (Math.cos(deg2rad(lat)) * Math.cos(deg2rad(dec)));

  if (cosH > 1 || cosH < -1) return noon;

  const h = rad2deg(Math.acos(cosH)) / 15;
  return isMorning ? noon - h : noon + h;
};

const computeAsrTime = (
  factor: number,
  dec: number,
  noon: number,
  lat: number
): number => {
  const sunAltitudeAtNoon = 90 - Math.abs(lat - dec);
  const shadowLengthAtNoon = Math.tan(deg2rad(90 - sunAltitudeAtNoon));
  const asrShadowLength = shadowLengthAtNoon + factor;
  const asrSunAltitude = rad2deg(Math.atan(1 / asrShadowLength));
  
  const cosH = (
    Math.sin(deg2rad(asrSunAltitude)) -
    Math.sin(deg2rad(lat)) * Math.sin(deg2rad(dec))
  ) / (Math.cos(deg2rad(lat)) * Math.cos(deg2rad(dec)));

  if (cosH > 1 || cosH < -1) return noon;
  
  const hourAngle = rad2deg(Math.acos(cosH)) / 15;
  return noon + hourAngle;
};

export const calculatePrayerTimes = (
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method: CalculationMethod = 'ISNA'
): Prayer[] => {
  const timezone = -date.getTimezoneOffset() / 60;
  const jd = julianDate(date);
  const d = jd - 2451545.0;

  const dec = sunDeclination(d);
  const eqt = equationOfTime(d);

  const noon = 12 - longitude / 15 - eqt / 60;

  const methodParams = CALCULATION_METHODS[method];

  const fajrTime = computeTime(methodParams.fajr, dec, noon, latitude, true);
  const dhuhrTime = noon;
  const asrTime = computeAsrTime(1, dec, noon, latitude);
  const maghribTime = computeTime(0.833, dec, noon, latitude, false);

  let ishaTime: number;
  if (typeof methodParams.isha === 'number') {
    if (methodParams.isha >= 60) {
      ishaTime = maghribTime + methodParams.isha / 60;
    } else {
      ishaTime = computeTime(methodParams.isha, dec, noon, latitude, false);
    }
  } else {
    ishaTime = maghribTime + 1.5;
  }

  const formatTime = (hours: number): { time: string; timestamp: number } => {
    const adjustedHours = fixHour(hours + timezone);
    const hour = Math.floor(adjustedHours);
    const minute = Math.round((adjustedHours - hour) * 60);
    
    const finalHour = minute === 60 ? hour + 1 : hour;
    const finalMinute = minute === 60 ? 0 : minute;
    
    const period = finalHour >= 12 ? 'PM' : 'AM';
    const displayHour = finalHour > 12 ? finalHour - 12 : finalHour === 0 ? 12 : finalHour;

    const dateWithTime = new Date(date);
    dateWithTime.setHours(finalHour, finalMinute, 0, 0);

    return {
      time: `${displayHour}:${finalMinute.toString().padStart(2, '0')} ${period}`,
      timestamp: dateWithTime.getTime(),
    };
  };

  const now = Date.now();
  const fajr = formatTime(fajrTime);
  const dhuhr = formatTime(dhuhrTime);
  const asr = formatTime(asrTime);
  const maghrib = formatTime(maghribTime);
  const isha = formatTime(ishaTime);

  return [
    {
      name: 'Fajr',
      nameArabic: 'الفجر',
      time: fajr.time,
      timestamp: fajr.timestamp,
      completed: now >= fajr.timestamp && now < dhuhr.timestamp ? false : now >= dhuhr.timestamp,
    },
    {
      name: 'Dhuhr',
      nameArabic: 'الظهر',
      time: dhuhr.time,
      timestamp: dhuhr.timestamp,
      completed: now >= dhuhr.timestamp && now < asr.timestamp ? false : now >= asr.timestamp,
    },
    {
      name: 'Asr',
      nameArabic: 'العصر',
      time: asr.time,
      timestamp: asr.timestamp,
      completed: now >= asr.timestamp && now < maghrib.timestamp ? false : now >= maghrib.timestamp,
    },
    {
      name: 'Maghrib',
      nameArabic: 'المغرب',
      time: maghrib.time,
      timestamp: maghrib.timestamp,
      completed: now >= maghrib.timestamp && now < isha.timestamp ? false : now >= isha.timestamp,
    },
    {
      name: 'Isha',
      nameArabic: 'العشاء',
      time: isha.time,
      timestamp: isha.timestamp,
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
