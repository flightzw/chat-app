import { Button, Calendar } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

import './index.scss';

type DateSelectorProps = {
  onComfirm: (startDate: Dayjs, endDate: Dayjs) => void;
};

const defaultRange: [Dayjs, Dayjs] = [
  dayjs(dayjs().format('YYYY-MM-DD')).add(-180, 'day'),
  dayjs(dayjs().format('YYYY-MM-DD')),
];

export default function DateSelector({ onComfirm }: DateSelectorProps) {
  const [selectRange, setSelectRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([...defaultRange]);
  const [startRange, setStartRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([...defaultRange]);
  const [endRange, setEndRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([...defaultRange]);

  const handleSelectDate = (date: Dayjs, idx: number) => {
    if (idx === 0) {
      date = date.isAfter(endRange[1]) ? endRange[1] : date;
      setEndRange([date, endRange[1]]);
    } else {
      date = date.isBefore(startRange[0]) ? startRange[0] : date;
      setStartRange([startRange[0], date]);
    }
    selectRange[idx] = date;
    setSelectRange([...selectRange]);
  };
  return (
    <div className="date-selector-container">
      <div className="date-selector-header">
        <div>起始日期：{selectRange[0].format('YYYY-MM-DD')}</div>
        <div>结束日期：{selectRange[1].format('YYYY-MM-DD')}</div>
        <Button type="primary" onClick={() => onComfirm(selectRange[0], selectRange[1])}>
          确认
        </Button>
      </div>
      <div>
        <Calendar
          value={selectRange[0]}
          fullscreen={false}
          validRange={startRange}
          onSelect={(date) => handleSelectDate(date, 0)}
        />
        <Calendar
          value={selectRange[1]}
          fullscreen={false}
          validRange={endRange}
          onSelect={(date) => handleSelectDate(date, 1)}
        />
      </div>
    </div>
  );
}
