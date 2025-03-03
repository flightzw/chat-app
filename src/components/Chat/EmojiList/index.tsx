import emoji from '@/utils/emoji';

import './index.scss';

type EmojiListProps = {
  onSelect: (emoji: string, url: string) => void;
};

export default function EmojiList({ onSelect }: EmojiListProps) {
  const { baseUrl, tags, groups } = emoji;
  return (
    <div className="emoji-container">
      {groups.map((row, idx) => {
        const imgs = row.map((item) => {
          const url = `${baseUrl}/${tags.indexOf(item)}.gif`;
          return <img onClick={() => onSelect(item, url)} title={item} key={item} style={{ margin: 5 }} src={url} />;
        });
        imgs.push(<br key="newline" />);
        return <div key={idx}>{imgs}</div>;
      })}
    </div>
  );
}
