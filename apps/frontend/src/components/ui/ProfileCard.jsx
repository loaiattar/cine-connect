const ProfileCard = ({
  name,
  initials,
  memberSince,
  bio,
  stats,
  isLoading,
}) => {
  return (
    <div className="bg-black text-white rounded-2xl p-6 w-full max-w-xl">
      avatar
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-white text-xl font-bold">{initials}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
