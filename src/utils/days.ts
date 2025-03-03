import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

const dateFormatStr = 'YYYY-MM-DD';

function formatSendTime(timeStr: string) {
  if (!timeStr) {
    return '';
  }

  const sendTime = dayjs(timeStr);
  const now = dayjs();

  if (sendTime.isAfter(now.add(-60, 'second'))) {
    const diffval = now.second() - sendTime.second();
    return diffval === 0 ? '现在' : `${(now.second() + 60 - sendTime.second()) % 60}秒前`;
  }
  if (sendTime.isAfter(now.add(-1801, 'second'))) {
    return `${(now.minute() + 60 - sendTime.minute()) % 60}分钟前`;
  }
  if (sendTime.isAfter(dayjs(now.format(dateFormatStr)).add(-1, 'day').add(-1, 'second'))) {
    return sendTime.date() === now.date() ? sendTime.format('HH:mm') : `昨天${sendTime.format('HH:mm')}`;
  }
  if (now.year() === sendTime.year() && now.week() === sendTime.week()) {
    return `${sendTime.format('dddHH:mm')}`;
  }

  return sendTime.format('YY/MM/DD');
}

export default {
  formatSendTime,
};
