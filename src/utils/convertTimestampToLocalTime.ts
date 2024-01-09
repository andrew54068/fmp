export default function convertTimestampToLocalTime(timestamp: string): string {

  const truncatedTimestamp = timestamp.split('.')[0] + "Z";

  const date = new Date(truncatedTimestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  return new Intl.DateTimeFormat('default', options).format(date);
}
