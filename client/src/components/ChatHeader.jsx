import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    const isGroup = Array.isArray(selectedUser?.members); // groups have members array

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img
                                src={isGroup ? selectedUser.groupPic || "/group-avatar.png" : selectedUser.profilePic || "/avatar.png"}
                                alt={selectedUser.name || selectedUser.fullName}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="font-medium">
                            {isGroup ? selectedUser.name : selectedUser.fullName}
                        </h3>
                        {isGroup ? (
                            <div className="flex -space-x-2 mt-1">
                                {selectedUser.members.slice(0, 5).map((member) => (
                                    <img
                                        key={member._id}
                                        src={member.profilePic || "/avatar.png"}
                                        alt={member.fullName}
                                        className="w-6 h-6 rounded-full border-2 border-white"
                                    />
                                ))}
                                {selectedUser.members.length > 5 && (
                                    <span className="text-xs text-zinc-500 ml-2">
                                        +{selectedUser.members.length - 5} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-base-content/70">
                                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Close button */}
                <button onClick={() => setSelectedUser(null)}>
                    <X />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
