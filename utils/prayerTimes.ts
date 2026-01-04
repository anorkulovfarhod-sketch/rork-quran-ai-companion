export type Prayer = {
  name: string;
  nameArabic: string;
  time: string;
  timestamp: number;
  completed: boolean;
};

const deg2rad = (deg: number): number => deg * Math.PI / 180;
const rad2deg = (rad: number): number => rad * 180 / Math.PI;

export const calculatePrayerTimes = async (
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<Prayer[]> => {
  try {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=3`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    const timings = data.data.timings;

    const convertTo12Hour = (time24: string): string => {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const createTimestamp = (time24: string): number => {
      const [hours, minutes] = time24.split(':').map(Number);
      const dateWithTime = new Date(date);
      dateWithTime.setHours(hours, minutes, 0, 0);
      return dateWithTime.getTime();
    };

    const now = Date.now();

    const fajrTimestamp = createTimestamp(timings.Fajr);
    const dhuhrTimestamp = createTimestamp(timings.Dhuhr);
    const asrTimestamp = createTimestamp(timings.Asr);
    const maghribTimestamp = createTimestamp(timings.Maghrib);
    const ishaTimestamp = createTimestamp(timings.Isha);

    return [
      {
        name: 'Fajr',
        nameArabic: 'الفجر',
        time: convertTo12Hour(timings.Fajr),
        timestamp: fajrTimestamp,
        completed: now >= fajrTimestamp && now < dhuhrTimestamp ? false : now >= dhuhrTimestamp,
      },
      {
        name: 'Dhuhr',
        nameArabic: 'الظهر',
        time: convertTo12Hour(timings.Dhuhr),
        timestamp: dhuhrTimestamp,
        completed: now >= dhuhrTimestamp && now < asrTimestamp ? false : now >= asrTimestamp,
      },
      {
        name: 'Asr',
        nameArabic: 'العصر',
        time: convertTo12Hour(timings.Asr),
        timestamp: asrTimestamp,
        completed: now >= asrTimestamp && now < maghribTimestamp ? false : now >= maghribTimestamp,
      },
      {
        name: 'Maghrib',
        nameArabic: 'المغرب',
        time: convertTo12Hour(timings.Maghrib),
        timestamp: maghribTimestamp,
        completed: now >= maghribTimestamp && now < ishaTimestamp ? false : now >= ishaTimestamp,
      },
      {
        name: 'Isha',
        nameArabic: 'العشاء',
        time: convertTo12Hour(timings.Isha),
        timestamp: ishaTimestamp,
        completed: false,
      },
    ];
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return [];
  }
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
