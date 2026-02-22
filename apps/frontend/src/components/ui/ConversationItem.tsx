type Props = {
  name: string;
  preview: string;
  date: string;
  avatarColor?: string;
};

const ConversationItem = ({ name, preview, date, avatarColor = "#f59e0b" }: Props) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3">

      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        {initial}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{name}</p>
        <p className="text-[#888] text-sm truncate">{preview}</p>
      </div>

      {/* Date */}
      <span className="text-[#888] text-xs self-start shrink-0">{date}</span>

    </div>
  );
};

export default ConversationItem;
