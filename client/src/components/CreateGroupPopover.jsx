import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { DoorClosed, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
const CreateGroupPopover = ({ onClose }) => {
    const { authUser } = useAuthStore();
    const [groupName, setGroupName] = useState("");
    const [users, setUsers] = useState([]); // List of all users
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Fetch users based on search query
    useEffect(() => {
        const fetchUsers = async () => {
            if (searchQuery.trim()) {
                try {
                    const response = await axiosInstance.get(`/messages/search-users?search=${searchQuery}`);

                    // Ensure the response data is an array
                    const allUsers = Array.isArray(response.data) ? response.data : [];
                    const filtered = authUser?._id
                        ? allUsers.filter((u) => u._id !== authUser._id)
                        : allUsers;
                    console.log("USSERSS: ", filtered);

                    setUsers(filtered);
                } catch (error) {
                    console.error("Error fetching users:", error);
                    setUsers([]); // Set an empty array if the request fails
                }
            } else {
                setUsers([]);
            }
        };

        fetchUsers();
    }, [searchQuery]);


    // Handle adding users to the group
    const handleAddUser = (user) => {
        if (!selectedUsers.some((selected) => selected._id === user._id)) {
            setSelectedUsers((prevUsers) => [...prevUsers, user]);
        }
    };

    // Handle creating the group
    const handleCreateGroup = async () => {
        if (groupName.trim() && selectedUsers.length > 0) {
            try {
                // Assuming an API endpoint to create a group
                const response = await axiosInstance.post("/messages/groups", {
                    name: groupName,
                    members: selectedUsers.map((user) => user._id),
                });
                // You can do something with the response here (e.g., show a success message or close the modal)
                console.log("Group created:", response.data);
                onClose(); // Close the popup after creating the group
            } catch (error) {
                console.error("Error creating group:", error);
            }
        } else {
            alert("Please enter a group name and add at least one user.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-sm h-[500px] bg-white border border-zinc-300 rounded-xl shadow-xl p-6 flex flex-col">

                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                    <h3 className="text-lg font-semibold mb-4 text-zinc-800">Create Group</h3>

                    {/* Group Name Input */}
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Group name"
                        className="w-full border px-3 py-2 rounded-md text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />

                    {/* User Search */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="w-full border px-3 py-2 rounded-md text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />

                    {/* Search Results Dropdown */}
                    {searchQuery && users.length > 0 && (
                        <ul className="max-h-40 overflow-y-auto border bg-white text-zinc-800 text-sm rounded-md shadow-md mb-4">
                            {users.map((user) => (
                                <li
                                    key={user._id}
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-200"
                                    onClick={() => handleAddUser(user)}
                                >
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.name}
                                        className="w-8 h-8 object-cover rounded-full"
                                    />
                                    <span>{user.fullName}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-semibold text-zinc-700 mb-1">Selected Users</h4>
                            <ul className="bg-zinc-100 rounded-md p-2 space-y-1">
                                {selectedUsers.map((user) => (
                                    <li
                                        key={user._id}
                                        className="flex items-center justify-between text-sm text-zinc-800"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={user.profilePic || "/avatar.png"}
                                                alt={user.name}
                                                className="w-5 h-5 object-cover rounded-full"
                                            />
                                            {user.fullName}
                                        </div>
                                        <button
                                            onClick={() =>
                                                setSelectedUsers(
                                                    selectedUsers.filter((u) => u._id !== user._id)
                                                )
                                            }
                                            className="text-red-500 text-xs ml-2"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Fixed Create Group Button */}
                <div className="pt-3 sticky bottom-0 bg-white mt-auto">
                    <button
                        onClick={handleCreateGroup}
                        className="w-full bg-zinc-800 text-white text-sm py-2 rounded-md hover:bg-zinc-900 transition"
                    >
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );



};

export default CreateGroupPopover;
