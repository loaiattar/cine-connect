type Props = {
  name: string;
  preview: string;
  date: string;
  avatarColor?: string;
};

const ConversationItem = ({ name, preview, date, avatarColor = "#f59e0b" }: Props) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-3 py-4 max-w-[200px]">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: avatarColor }}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-xs">{name}</p>
        <p className="text-[#888] text-xs truncate">{preview}</p>
      </div>
      <span className="text-[#888] text-xs self-start shrink-0">{date}</span>
    </div>
  );
};

export default ConversationItem;
