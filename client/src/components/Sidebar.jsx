import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Plus, Users } from "lucide-react";
import CreateGroupPopover from "./CreateGroupPopover";


const Sidebar = () => {
    const { getUsers, getGroups, users, groups, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const [isGroupPopUpOpen, setIsGroupPopUpOpen] = useState(false);
    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [showGroups, setShowGroups] = useState(true);
    const [showUsers, setShowUsers] = useState(true);

    useEffect(() => {
        getUsers();
        getGroups();
    }, [getUsers, getGroups]);

    const filteredUsers = showOnlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users;

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="size-6" />
                        <span className="font-medium hidden lg:block">Contacts</span>
                    </div>
                    <div className="relative hidden lg:block">
                        <button
                            onClick={() => setIsGroupPopUpOpen((prev) => !prev)}
                            className="text-xs px-2 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-800 transition-colors"
                        >
                            <Plus className="size-6" />
                        </button>

                        {isGroupPopUpOpen && <CreateGroupPopover onClose={() => setIsGroupPopUpOpen(false)} />}
                    </div>
                </div>

                <div className="mt-3 hidden lg:flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
                </div>
            </div>

            <div className="overflow-y-auto w-full py-3 space-y-4">
                {/* Groups Section */}
                {groups.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-xs text-zinc-500">Groups</span>
                            <button
                                onClick={() => setShowGroups((prev) => !prev)}
                                className="text-xs text-blue-500 hover:underline"
                            >
                                {showGroups ? "Hide" : "Show"}
                            </button>
                        </div>

                        {showGroups && groups.map((group) => (
                            <button
                                key={group._id}
                                onClick={() => setSelectedUser(group)} // assuming same structure for now
                                className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
                                    }`}
                            >
                                <div className="relative mx-auto lg:mx-0">
                                    <img
                                        src={group.groupPic || "/group-avatar.png"}
                                        alt={group.name}
                                        className="size-12 object-cover rounded-full"
                                    />
                                </div>
                                <div className="hidden lg:block text-left min-w-0">
                                    <div className="font-medium truncate">{group.name}</div>
                                    <div className="text-sm text-zinc-400">Group Chat</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Users Section */}
                <div>
                    <div className="flex items-center justify-between px-3 mb-2">
                        <span className="text-xs text-zinc-500">Users</span>
                        <button
                            onClick={() => setShowUsers((prev) => !prev)}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            {showUsers ? "Hide" : "Show"}
                        </button>
                    </div>

                    {showUsers && filteredUsers.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
                                }`}
                        >
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    alt={user.name}
                                    className="size-12 object-cover rounded-full"
                                />
                                {onlineUsers.includes(user._id) && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                )}
                            </div>
                            <div className="hidden lg:block text-left min-w-0">
                                <div className="font-medium truncate">{user.fullName}</div>
                                <div className="text-sm text-zinc-400">
                                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </button>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center text-zinc-500 py-4">No online users</div>
                    )}
                </div>
            </div>

        </aside>
    );
};
export default Sidebar;